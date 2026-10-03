import { PineIndicator } from '../types';

export const GQR_INDICATORS: PineIndicator[] = [
  {
    id: 'adaptive_supertrend',
    name: 'GQR Adaptive SuperTrend',
    description: 'An advanced trend-following indicator that automatically optimizes its ATR factor by tracking the cumulative performance of multiple SuperTrend parameters in parallel. Selects the highest-performing factor in real-time.',
    category: 'Trend & Performance',
    code: `//@version=5
indicator('GQR Adaptive SuperTrend [NexusDigitalArtShop]', overlay=true)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
atrLen      = input.int(10, 'ATR Length', minval=1)
factorMin   = input.float(1.0, 'Factor Min', minval=0.5, step=0.1)
factorMax   = input.float(5.0, 'Factor Max', minval=1.0, step=0.1)
factorStep  = input.float(0.5, 'Factor Step', minval=0.1, step=0.1)
bullColor   = input.color(#00e676, 'Uptrend')
bearColor   = input.color(#ff1744, 'Downtrend')
showSignals = input.bool(true, 'Show Entry Signals')

// ───────────────────────────────
// Generate factor list
// ───────────────────────────────
var float[] factors = array.new_float()
if barstate.isfirst
    f = factorMin
    while f <= factorMax
        array.push(factors, f)
        f += factorStep

// ───────────────────────────────
// ATR
// ───────────────────────────────
atr = ta.atr(atrLen)

// ───────────────────────────────
// Track multiple SuperTrends and their performance
// ───────────────────────────────
var float bestFactor = array.get(factors, 0)
var float bestPerf   = -1e10
var float[] perfArray  = array.new_float(array.size(factors), 0.0)
var int[]   trendArray = array.new_int(array.size(factors), 0)
var float[] upperArray = array.new_float(array.size(factors), 0.0)
var float[] lowerArray = array.new_float(array.size(factors), 0.0)

for i = 0 to array.size(factors) - 1
    factor = array.get(factors, i)
    up = hl2 + atr * factor
    dn = hl2 - atr * factor
    prevTrend = array.get(trendArray, i)
    prevUpper = array.get(upperArray, i)
    prevLower = array.get(lowerArray, i)

    newTrend = close > prevUpper ? 1 : close < prevLower ? -1 : prevTrend
    if newTrend == 1
        newLower = math.max(dn, prevLower)
        newUpper = up
    else
        newUpper = math.min(up, prevUpper)
        newLower = dn

    array.set(trendArray, i, newTrend)
    array.set(upperArray, i, newUpper)
    array.set(lowerArray, i, newLower)

    // Performance tracking (cumulative returns)
    prevPerf = array.get(perfArray, i)
    tradeRet = 0.0
    if prevTrend != newTrend
        tradeRet := prevTrend == 1 ? close - prevLower : prevUpper - close
    else if newTrend == 1
        tradeRet := close - close[1]
    else if newTrend == -1
        tradeRet := close[1] - close
    array.set(perfArray, i, prevPerf + tradeRet)

// ───────────────────────────────
// Select best factor based on performance
// ───────────────────────────────
for i = 0 to array.size(factors) - 1
    if array.get(perfArray, i) > bestPerf
        bestPerf   := array.get(perfArray, i)
        bestFactor := array.get(factors, i)

// ───────────────────────────────
// Final SuperTrend using best factor
// ───────────────────────────────
up = hl2 + atr * bestFactor
dn = hl2 - atr * bestFactor
var int trend = 0
var float trail = na
if trend == 1
    if close < trail
        trend := -1
        trail := up
    else
        trail := math.max(dn, trail)
else if trend == -1
    if close > trail
        trend := 1
        trail := dn
    else
        trail := math.min(up, trail)
else
    trend := close > up ? 1 : -1
    trail := trend == 1 ? dn : up

plot(trail, 'SuperTrend', trend == 1 ? bullColor : bearColor, 2)

// Signals
if showSignals
    if trend == 1 and trend[1] != 1
        label.new(bar_index, low, '▲', style=label.style_label_up, color=#00000000, textcolor=bullColor, size=size.normal)
    if trend == -1 and trend[1] != -1
        label.new(bar_index, high, '▼', style=label.style_label_down, color=#00000000, textcolor=bearColor, size=size.normal)

// Alerts
alertcondition(trend == 1 and trend[1] != 1, 'SuperTrend Long', 'GQR ST: Uptrend started')
alertcondition(trend == -1 and trend[1] != -1, 'SuperTrend Short', 'GQR ST: Downtrend started')`,
    inputs: [
      { name: 'ATR Length', type: 'integer', defaultVal: '10' },
      { name: 'Factor Min', type: 'float', defaultVal: '1.0' },
      { name: 'Factor Max', type: 'float', defaultVal: '5.0' },
      { name: 'Factor Step', type: 'float', defaultVal: '0.5' },
    ],
    alerts: ['SuperTrend Long', 'SuperTrend Short'],
  },
  {
    id: 'breaker_detector',
    name: 'GQR Breaker Block Detector',
    description: 'Tracks swing highs and lows to locate Order Blocks (OB). When price breaks strongly past an OB (making it a failed mitigation level) and subsequently closes back inside, a Breaker Block (BB) forms alongside Take Profit targets based on customized Risk-Reward inputs.',
    category: 'Smart Money Concepts',
    code: `//@version=5
indicator('GQR Breaker Block Detector [NexusDigitalArtShop]', overlay=true, max_lines_count=500, max_boxes_count=500, max_labels_count=500)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
swingLen        = input.int(5, 'Swing Detection Length', minval=3)
useBody         = input.bool(true, 'Use Candle Body for OB')
mitigationSrc   = input.string('Close', 'Mitigation Source', options=['Close', 'Wick'])
enableTP        = input.bool(true, 'Show Take Profit Levels')
riskReward1     = input.float(2.0, 'R:R 1', minval=0.5)   
riskReward2     = input.float(3.0, 'R:R 2', minval=0.5)
showSignals     = input.bool(true, 'Show Entry Signals')
bullColor       = input.color(#00c853, 'Bullish Breaker')
bearColor       = input.color(#ff1744, 'Bearish Breaker')
tpColor         = input.color(#2157f3, 'Take Profit')

// ───────────────────────────────
// Functions
// ───────────────────────────────
getSwings(len) =>
    upper = ta.highest(len)
    lower = ta.lowest(len)
    var int os = 0
    os := high[len] > upper ? 0 : low[len] < lower ? 1 : os[1]
    top = os == 0 and os[1] != 0 ? high[len] : na
    btm = os == 1 and os[1] != 1 ? low[len]  : na
    [top, btm]

// ───────────────────────────────
// Track swing arrays
// ───────────────────────────────
[ph, pl] = getSwings(swingLen)

var float[] swingHighs = array.new_float()
var int[]   swingBarsH = array.new_int()
var float[] swingLows  = array.new_float()
var int[]   swingBarsL = array.new_int()

if not na(ph)
    array.unshift(swingHighs, ph)
    array.unshift(swingBarsH, bar_index - swingLen)
if not na(pl)
    array.unshift(swingLows, pl)
    array.unshift(swingBarsL, bar_index - swingLen)

// ───────────────────────────────
// Order Block data storage
// ───────────────────────────────
var float lastBullOBTop  = na
var float lastBullOBBtm  = na
var int   lastBullOBTime = na
var float lastBearOBTop  = na
var float lastBearOBBtm  = na
var int   lastBearOBTime = na

if not na(pl) and array.size(swingLows) >= 1
    startIdx = array.get(swingBarsL, 0)
    for i = startIdx to bar_index - 1
        if close[i] < open[i]
            top = useBody ? math.max(close[i], open[i]) : high[i]
            btm = useBody ? math.min(close[i], open[i]) : low[i]
            lastBullOBTop  := top
            lastBullOBBtm  := btm
            lastBullOBTime := time[i]
            break

if not na(ph) and array.size(swingHighs) >= 1
    startIdx = array.get(swingBarsH, 0)
    for i = startIdx to bar_index - 1
        if close[i] > open[i]
            top = useBody ? math.max(close[i], open[i]) : high[i]
            btm = useBody ? math.min(close[i], open[i]) : low[i]
            lastBearOBTop  := top
            lastBearOBBtm  := btm
            lastBearOBTime := time[i]
            break

// ───────────────────────────────
// Breaker Block Logic
// ───────────────────────────────
var bool bullBreakerActive = false
var box bullBB = na
var line bullTP1 = na, bullTP2 = na
var label bullSignal = na

if not na(lastBearOBTop)
    breakBelow = mitigationSrc == 'Close' ? close[1] < lastBearOBBtm : low[1] < lastBearOBBtm
    if breakBelow and not bullBreakerActive and close > lastBearOBBtm
        bullBreakerActive := true
        bullBB := box.new(lastBearOBTime, lastBearOBTop, bar_index, lastBearOBBtm,
          bgcolor=color.new(bullColor, 90), border_color=bullColor, text='+BB',
          text_color=bullColor, text_size=size.small)
        obHeight = lastBearOBTop - lastBearOBBtm
        if enableTP
            bullTP1 := line.new(bar_index, lastBearOBTop + obHeight * riskReward1,
              bar_index+20, lastBearOBTop + obHeight * riskReward1,
              color=tpColor, style=line.style_dotted)
            bullTP2 := line.new(bar_index, lastBearOBTop + obHeight * riskReward2,
              bar_index+20, lastBearOBTop + obHeight * riskReward2,
              color=tpColor, style=line.style_dotted)
        if showSignals
            bullSignal := label.new(bar_index, lastBearOBBtm, 'LONG',
              style=label.style_label_up, color=bullColor, textcolor=color.white, size=size.small)

if bullBreakerActive
    if close < lastBearOBBtm
        bullBreakerActive := false
        box.delete(bullBB)
        line.delete(bullTP1)
        line.delete(bullTP2)
        label.delete(bullSignal)
    else
        box.set_right(bullBB, bar_index)
        if enableTP
            line.set_x2(bullTP1, bar_index+20)
            line.set_x2(bullTP2, bar_index+20)

var bool bearBreakerActive = false
var box bearBB = na
var line bearTP1 = na, bearTP2 = na
var label bearSignal = na

if not na(lastBullOBTop)
    breakAbove = mitigationSrc == 'Close' ? close[1] > lastBullOBTop : high[1] > lastBullOBTop
    if breakAbove and not bearBreakerActive and close < lastBullOBTop
        bearBreakerActive := true
        bearBB := box.new(lastBullOBTime, lastBullOBTop, bar_index, lastBullOBBtm,
          bgcolor=color.new(bearColor, 90), border_color=bearColor, text='-BB',
          text_color=bearColor, text_size=size.small)
        obHeight = lastBullOBTop - lastBullOBBtm
        if enableTP
            bearTP1 := line.new(bar_index, lastBullOBBtm - obHeight * riskReward1,
              bar_index+20, lastBullOBBtm - obHeight * riskReward1,
              color=tpColor, style=line.style_dotted)
            bearTP2 := line.new(bar_index, lastBullOBBtm - obHeight * riskReward2,
              bar_index+20, lastBullOBBtm - obHeight * riskReward2,
              color=tpColor, style=line.style_dotted)
        if showSignals
            bearSignal := label.new(bar_index, lastBullOBTop, 'SHORT',
              style=label.style_label_down, color=bearColor, textcolor=color.white, size=size.small)

if bearBreakerActive
    if close > lastBullOBTop
        bearBreakerActive := false
        box.delete(bearBB)
        line.delete(bearTP1)
        line.delete(bearTP2)
        label.delete(bearSignal)
    else
        box.set_right(bearBB, bar_index)
        if enableTP
            line.set_x2(bearTP1, bar_index+20)
            line.set_x2(bearTP2, bar_index+20)

// ───────────────────────────────
// Alerts
// ───────────────────────────────
alertcondition(bullBreakerActive and not bullBreakerActive[1], 'Bullish Breaker', 'GQR Breaker: Bullish breaker block formed')
alertcondition(bearBreakerActive and not bearBreakerActive[1], 'Bearish Breaker', 'GQR Breaker: Bearish breaker block formed')`,
    inputs: [
      { name: 'Swing Length', type: 'integer', defaultVal: '5' },
      { name: 'Use Candle Body for OB', type: 'boolean', defaultVal: 'true' },
      { name: 'Mitigation Source', type: 'string (Close/Wick)', defaultVal: '"Close"' },
      { name: 'R:R 1 Setting', type: 'float', defaultVal: '2.0' },
      { name: 'R:R 2 Setting', type: 'float', defaultVal: '3.0' },
    ],
    alerts: ['Bullish Breaker', 'Bearish Breaker'],
  },
  {
    id: 'depth_of_market',
    name: 'GQR Depth of Market',
    description: 'Renders an interactive market depth profile on the price chart, calculating the cumulative volume bids and asks at granular ticks. Represents institutional buy-wall and sell-wall densities.',
    category: 'Order Flow & Volume',
    code: `//@version=5
indicator('GQR Depth of Market [NexusDigitalArtShop]', overlay=true, max_boxes_count=1000)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
numLevels    = input.int(30, 'Number of Price Levels', minval=10, maxval=100)
profileWidth = input.int(15, 'Profile Width %', minval=5, maxval=50) / 100
bidColor     = input.color(#089981, 'Bid Volume')
askColor     = input.color(#f23645, 'Ask Volume')

// ───────────────────────────────
// DOM data accumulation
// ───────────────────────────────
var float[] volBid = array.new_float(numLevels, 0.0)
var float[] volAsk = array.new_float(numLevels, 0.0)

priceStep = syminfo.mintick * 10
for i = 0 to numLevels - 1
    level = close - i * priceStep
    if high >= level and low <= level + priceStep
        if close > open
            array.set(volBid, i, array.get(volBid, i) + volume)
        else
            array.set(volAsk, i, array.get(volAsk, i) + volume)

// ───────────────────────────────
// Draw DOM profile
// ───────────────────────────────
if barstate.islast
    maxVol = math.max(array.max(volBid), array.max(volAsk))
    for i = 0 to numLevels - 1
        level = close - i * priceStep
        // Bid bar
        bidWidth = array.get(volBid, i) / maxVol * profileWidth * 100
        box.new(bar_index, level, bar_index + bidWidth, level + priceStep, bgcolor=bidColor, border_color=na)
        // Ask bar (mirrored)
        askWidth = array.get(volAsk, i) / maxVol * profileWidth * 100
        box.new(bar_index, level, bar_index - askWidth, level + priceStep, bgcolor=askColor, border_color=na)`,
    inputs: [
      { name: 'Number of Price Levels', type: 'integer', defaultVal: '30' },
      { name: 'Profile Width %', type: 'integer', defaultVal: '15' },
    ],
    alerts: [],
  },
  {
    id: 'elliott_wave',
    name: 'GQR Elliott Wave',
    description: 'Implements a visual 5-wave motive impulse wave and ABC correction identifier using adaptive swing algorithms. Label structures auto-align chronologically.',
    category: 'Trend & Structure',
    code: `//@version=5
indicator('GQR Elliott Wave [NexusDigitalArtShop]', overlay=true, max_lines_count=500, max_labels_count=500)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
swingLen  = input.int(5, 'Swing Length', minval=3)
waveColor = input.color(#ffeb3b, 'Wave Color')
showABC   = input.bool(true, 'Show Corrections (ABC)')

// ───────────────────────────────
// Swing detection
// ───────────────────────────────
getSwings(len)=>
    upper = ta.highest(len)
    lower = ta.lowest(len)
    var int os = 0
    os := high[len] > upper ? 0 : low[len] < lower ? 1 : os[1]
    [os == 0 and os[1] != 0, os == 1 and os[1] != 1]

[newHigh, newLow] = getSwings(swingLen)

var float[] swingPts  = array.new_float()
var int[]   swingBars = array.new_int()

if newHigh
    array.unshift(swingPts, high[swingLen])
    array.unshift(swingBars, bar_index - swingLen)
if newLow
    array.unshift(swingPts, low[swingLen])
    array.unshift(swingBars, bar_index - swingLen)

// ───────────────────────────────
// Elliott Wave detection (5-wave motive)
// ───────────────────────────────
if array.size(swingPts) >= 6
    p1 = array.get(swingPts, 5)
    p2 = array.get(swingPts, 4)
    p3 = array.get(swingPts, 3)
    p4 = array.get(swingPts, 2)
    p5 = array.get(swingPts, 1)
    p6 = array.get(swingPts, 0)

    if p2 > p1 and p3 > p2 and p4 > p3 and p5 > p4 and p6 > p5
        label.new(array.get(swingBars, 4), p2, '1', style=label.style_label_up, color=waveColor, textcolor=color.white)
        label.new(array.get(swingBars, 3), p3, '2', style=label.style_label_down, color=waveColor, textcolor=color.white)
        label.new(array.get(swingBars, 2), p4, '3', style=label.style_label_up, color=waveColor, textcolor=color.white)
        label.new(array.get(swingBars, 1), p5, '4', style=label.style_label_down, color=waveColor, textcolor=color.white)
        label.new(array.get(swingBars, 0), p6, '5', style=label.style_label_up, color=waveColor, textcolor=color.white)
        
        if showABC and array.size(swingPts) >= 9
            a = array.get(swingPts, 2)
            b = array.get(swingPts, 1)
            c = array.get(swingPts, 0)
            label.new(array.get(swingBars, 2), a, 'A', style=label.style_label_down, color=color.red, textcolor=color.white)
            label.new(array.get(swingBars, 1), b, 'B', style=label.style_label_up, color=color.red, textcolor=color.white)
            label.new(array.get(swingBars, 0), c, 'C', style=label.style_label_down, color=color.red, textcolor=color.white)

while array.size(swingPts) > 50
    array.pop(swingPts)
    array.pop(swingBars)`,
    inputs: [
      { name: 'Swing Length', type: 'integer', defaultVal: '5' },
      { name: 'Show Corrections (ABC)', type: 'boolean', defaultVal: 'true' },
    ],
    alerts: [],
  },
  {
    id: 'ict_killzones',
    name: 'GQR ICT Killzones Toolkit',
    description: 'Highlights key institutional trading sessions: Asian, London, and New York Killzones in Eastern Standard Time (UTC-5). Plots session highs, lows, midlines, and session open boundaries.',
    category: 'Sessions & Hours',
    code: `//@version=5
indicator('GQR ICT Killzones Toolkit [NexusDigitalArtShop]', overlay=true, max_lines_count=500, max_boxes_count=500, max_labels_count=500)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
showNY    = input.bool(true, 'New York')
nySession = input.session('0830-1100', 'NY Time')
nyColor   = input.color(color.new(#ff5d00, 90), 'NY Color')

showLDN   = input.bool(true, 'London')
ldnSession= input.session('0300-0600', 'LDN Time')
ldnColor  = input.color(color.new(#00bcd4, 90), 'LDN Color')

showAsia  = input.bool(true, 'Asia')
asiaSession=input.session('2000-0000', 'Asia Time')
asiaColor = input.color(color.new(#e91e63, 90), 'Asia Color')

showLines = input.bool(true, 'Session High/Low Lines')
showMid   = input.bool(true, 'Session Mid Lines')
showOpen  = input.bool(true, 'Session Open Price')

// ───────────────────────────────
// Session highlighting & lines
// ───────────────────────────────
processSession(string session, color col, bool show)=>
    inSession = not na(time('1', session, 'UTC-5')) and show
    bgcolor(inSession ? col : na)
    
    var float sesHigh = na
    var float sesLow  = na
    var int   sesStart = na
    if inSession and not inSession[1]
        sesHigh := high
        sesLow  := low
        sesStart := bar_index
    if inSession
        sesHigh := math.max(high, sesHigh)
        sesLow  := math.min(low, sesLow)
        if showLines
            line.new(sesStart, sesHigh, bar_index, sesHigh, color=col, style=line.style_dashed)
            line.new(sesStart, sesLow, bar_index, sesLow, color=col, style=line.style_dashed)
            if showMid
                sesMid = math.avg(sesHigh, sesLow)
                line.new(sesStart, sesMid, bar_index, sesMid, color=color.new(col, 80), style=line.style_dotted)
            if showOpen
                line.new(sesStart, open, bar_index, open, color=color.new(col, 50), style=line.style_dotted)

processSession(nySession, nyColor, showNY)
processSession(ldnSession, ldnColor, showLDN)
processSession(asiaSession, asiaColor, showAsia)

if ta.change(dayofweek)
    line.new(bar_index, high + syminfo.mintick, bar_index, low - syminfo.mintick,
      color=color.gray, style=line.style_dashed, extend=extend.both)`,
    inputs: [
      { name: 'Show NY', type: 'boolean', defaultVal: 'true' },
      { name: 'NY Session hours', type: 'session', defaultVal: '"0830-1100"' },
      { name: 'Show London', type: 'boolean', defaultVal: 'true' },
      { name: 'Show Asia', type: 'boolean', defaultVal: 'true' },
    ],
    alerts: [],
  },
  {
    id: 'liquidity_pools',
    name: 'GQR Liquidity Pools',
    description: 'Tracks pivot zones to find multiple contacts of highs and lows. When a threshold is met (double-top, triple-top etc), indicates Buyside or Sellside Liquidity pools.',
    category: 'Smart Money Concepts',
    code: `//@version=5
indicator('GQR Liquidity Pools [NexusDigitalArtShop]', overlay=true, max_lines_count=500, max_boxes_count=500, max_labels_count=500)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
contactCount   = input.int(2, 'Contacts Required', minval=2)
gapBars        = input.int(5, 'Bars Between Contacts')
confirmBars    = input.int(10, 'Confirmation Bars')
bullColor      = input.color(#089981, 'Buyside Pool')
bearColor      = input.color(#f23645, 'Sellside Pool')
showVolume     = input.bool(true, 'Show Volume')

// ───────────────────────────────
// Track high/low contacts
// ───────────────────────────────
var float highest      = 0.0
var float lowest       = 1000000.0
var int   highContacts = 0
var int   lowContacts  = 0
var int   lastHighContact = 0
var int   lastLowContact  = 0

swingHigh = ta.pivothigh(5, 5)
swingLow  = ta.pivotlow(5, 5)

if not na(swingHigh)
    if math.abs(swingHigh - highest) < 0.05 * highest and bar_index - lastHighContact > gapBars
        highContacts += 1
    else
        highest := swingHigh
        highContacts := 1
    lastHighContact := bar_index

if not na(swingLow)
    if math.abs(swingLow - lowest) < 0.05 * lowest and bar_index - lastLowContact > gapBars
        lowContacts += 1
    else
        lowest := swingLow
        lowContacts := 1
    lastLowContact := bar_index

// ───────────────────────────────
// Draw liquidity pools
// ───────────────────────────────
if highContacts >= contactCount and bar_index - lastHighContact > confirmBars
    box.new(lastHighContact, highest, bar_index, highest * 0.998,
      bgcolor=bearColor, border_color=na)

if lowContacts >= contactCount and bar_index - lastLowContact > confirmBars
    box.new(lastLowContact, lowest, bar_index, lowest * 1.002,
      bgcolor=bullColor, border_color=na)

if close > highest * 1.05
    highContacts := 0
if close < lowest * 0.95
    lowContacts := 0`,
    inputs: [
      { name: 'Contacts Required', type: 'integer', defaultVal: '2' },
      { name: 'Bars Between Contacts', type: 'integer', defaultVal: '5' },
    ],
    alerts: [],
  },
  {
    id: 'liquidity_swings',
    name: 'GQR Liquidity Swings',
    description: 'Tracks long-term swing points (minimum length of 14) and visualizes the high and low bands where buy-side and sell-side structural liquidity resides.',
    category: 'Trend & Structure',
    code: `//@version=5
indicator('GQR Liquidity Swings [NexusDigitalArtShop]', overlay=true, max_lines_count=500, max_boxes_count=500)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
swingLen   = input.int(14, 'Swing Length', minval=3)
showHigh   = input.bool(true, 'Swing Highs')
showLow    = input.bool(true, 'Swing Lows')
highColor  = input.color(color.red, 'High Color')
lowColor   = input.color(color.teal, 'Low Color')

// ───────────────────────────────
// Swing Detection
// ───────────────────────────────
upper = ta.highest(swingLen)
lower = ta.lowest(swingLen)

var int dir = 0
dir := high[swingLen] > upper ? 0 : low[swingLen] < lower ? 1 : dir[1]

ph = dir == 0 and dir[1] != 0 ? high[swingLen] : na
pl = dir == 1 and dir[1] != 1 ? low[swingLen]  : na

var float[] swingHighs = array.new_float()
var int[]   barsHigh   = array.new_int()
var float[] swingLows  = array.new_float()
var int[]   barsLow    = array.new_int()

if not na(ph)
    array.unshift(swingHighs, ph)
    array.unshift(barsHigh, bar_index - swingLen)
if not na(pl)
    array.unshift(swingLows, pl)
    array.unshift(barsLow, bar_index - swingLen)

// ───────────────────────────────
// Draw Liquidity Swings (zones)
// ───────────────────────────────
if showHigh
    for i = 0 to math.min(array.size(swingHighs) - 1, 5)
        box.new(array.get(barsHigh, i), array.get(swingHighs, i), bar_index, array.get(swingHighs, i),
          bgcolor=color.new(highColor, 85), border_color=na)
    if array.size(swingHighs) >= 1
        line.new(array.get(barsHigh, 0), array.get(swingHighs, 0), bar_index, array.get(swingHighs, 0), color=highColor)

if showLow
    for i = 0 to math.min(array.size(swingLows) - 1, 5)
        box.new(array.get(barsLow, i), array.get(swingLows, i), bar_index, array.get(swingLows, i),
          bgcolor=color.new(lowColor, 85), border_color=na)
    if array.size(swingLows) >= 1
        line.new(array.get(barsLow, 0), array.get(swingLows, 0), bar_index, array.get(swingLows, 0), color=lowColor)

while array.size(swingHighs) > 50
    array.pop(swingHighs)
while array.size(swingLows) > 50
    array.pop(swingLows)`,
    inputs: [
      { name: 'Swing Length', type: 'integer', defaultVal: '14' },
      { name: 'Show Highs', type: 'boolean', defaultVal: 'true' },
    ],
    alerts: [],
  },
  {
    id: 'money_flow_profile',
    name: 'GQR Money Flow Profile',
    description: 'Generates a heavy volume money flow profile over a configurable lookback period, resolving volume density and calculating the net sentiment on the right profile axis.',
    category: 'Order Flow & Volume',
    code: `//@version=5
indicator('GQR Money Flow Profile [NexusDigitalArtShop]', overlay=true, max_boxes_count=500, max_lines_count=500)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
lookback     = input.int(200, 'Lookback Length', minval=10)
numRows      = input.int(25, 'Number of Rows', minval=10, maxval=100)
profileWidth = input.int(13, 'Profile Width %', minval=10, maxval=50) / 100
bullColor    = input.color(#26a69a, 'Bullish Sentiment')
bearColor    = input.color(#ef5350, 'Bearish Sentiment')
volColor     = input.color(#ffeb3b, 'High Volume Node')

// ───────────────────────────────
// Determine price range
// ───────────────────────────────
var float pHigh = na
var float pLow  = na
if bar_index == last_bar_index - lookback
    pHigh := high
    pLow  := low
else if bar_index > last_bar_index - lookback
    pHigh := math.max(high, pHigh)
    pLow  := math.min(low, pLow)

pStep = (pHigh - pLow) / numRows

// ───────────────────────────────
// Volume & Money Flow
// ───────────────────────────────
var float[] volRows = array.new_float(numRows, 0.0)
var float[] buyRows = array.new_float(numRows, 0.0)

if barstate.islast and pStep > 0
    for i = 0 to lookback
        for row = 0 to numRows - 1
            levelLow  = pLow  + row * pStep
            levelHigh = pLow  + (row + 1) * pStep
            if high[lookback - i] >= levelLow and low[lookback - i] < levelHigh
                overlap = math.min(high[lookback - i], levelHigh) - math.max(low[lookback - i], levelLow)
                frac = overlap / (high[lookback - i] - low[lookback - i])
                array.set(volRows, row, array.get(volRows, row) + volume[lookback - i] * frac)
                if close[lookback - i] > open[lookback - i]
                    array.set(buyRows, row, array.get(buyRows, row) + volume[lookback - i] * frac)

    maxVol = array.max(volRows)
    
    for row = 0 to numRows - 1
        vol = array.get(volRows, row)
        buy = array.get(buyRows, row)
        sell = vol - buy
        sentiment = buy - sell
        
        barWidth = vol / maxVol * profileWidth * lookback
        if barWidth > 0
            box.new(bar_index, pLow + row * pStep, bar_index + barWidth, pLow + (row + 1) * pStep,
              bgcolor=color.from_gradient(vol/maxVol, 0, 1, color.new(volColor, 30), color.new(volColor, 90)),
              border_color=na)
        
        if buy + sell > 0
            sentimentNorm = sentiment / (buy + sell)
            sentimentBar = sentimentNorm * profileWidth * lookback * 0.5
            if sentimentBar > 0
                box.new(bar_index, pLow + row * pStep, bar_index + sentimentBar, pLow + (row + 1) * pStep,
                  bgcolor=bullColor, border_color=na)
            else if sentimentBar < 0
                box.new(bar_index + sentimentBar, pLow + row * pStep, bar_index, pLow + (row + 1) * pStep,
                  bgcolor=bearColor, border_color=na)`,
    inputs: [
      { name: 'Lookback Length', type: 'integer', defaultVal: '200' },
      { name: 'Number of Rows', type: 'integer', defaultVal: '25' },
      { name: 'Profile Width %', type: 'integer', defaultVal: '13' },
    ],
    alerts: [],
  },
  {
    id: 'sessions',
    name: 'GQR Sessions',
    description: 'Draws color bands for NY, London, Tokyo, and Sydney trading sessions with precise label boundaries.',
    category: 'Sessions & Hours',
    code: `//@version=5
indicator('GQR Sessions [NexusDigitalArtShop]', overlay=true)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
showNY      = input.bool(true, 'New York')
showLondon  = input.bool(true, 'London')
showTokyo   = input.bool(true, 'Tokyo')
showSydney  = input.bool(true, 'Sydney')
nyColor     = input.color(#ff5d00, 'NY Color')
londonColor = input.color(#2157f3, 'London Color')
tokyoColor  = input.color(#e91e63, 'Tokyo Color')
sydneyColor = input.color(#ffeb3b, 'Sydney Color')
showLabels  = input.bool(true, 'Show Session Names')

// ───────────────────────────────
// Session times (UTC-5)
// ───────────────────────────────
inNY      = not na(time('1', '0830-1100', 'UTC-5')) and showNY
inLondon  = not na(time('1', '0300-0600', 'UTC-5')) and showLondon
inTokyo   = not na(time('1', '1900-2200', 'UTC-5')) and showTokyo
inSydney  = not na(time('1', '1600-1900', 'UTC-5')) and showSydney

bgcolor(inNY ? nyColor : inLondon ? londonColor : inTokyo ? tokyoColor : inSydney ? sydneyColor : na)

if showLabels
    if inNY and not inNY[1]
        label.new(bar_index, high, 'NY', style=label.style_label_down, color=nyColor)
    if inLondon and not inLondon[1]
        label.new(bar_index, high, 'London', style=label.style_label_down, color=londonColor)
    if inTokyo and not inTokyo[1]
        label.new(bar_index, high, 'Tokyo', style=label.style_label_down, color=tokyoColor)
    if inSydney and not inSydney[1]
        label.new(bar_index, high, 'Sydney', style=label.style_label_down, color=sydneyColor)`,
    inputs: [
      { name: 'Highlight NY', type: 'boolean', defaultVal: 'true' },
      { name: 'Highlight London', type: 'boolean', defaultVal: 'true' },
    ],
    alerts: [],
  },
  {
    id: 'smart_money_toolkit',
    name: 'GQR Smart Money Toolkit',
    description: 'An all-in-one Smart Money indicator featuring Market Structure Shifts (MSS), Break of Structure (BOS), Order Blocks (OB) highlighting, Fair Value Gaps (FVG) detection, Liquidity pools, and optional session backgrounds.',
    category: 'Smart Money Concepts',
    code: `//@version=5
indicator('GQR Smart Money Toolkit [NexusDigitalArtShop]', overlay=true, max_lines_count=500, max_boxes_count=500, max_labels_count=500)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
swingLen      = input.int(10, 'Swing Detection Length', minval=3)
useBodyOB     = input.bool(true, 'OB: Use Candle Body')
showMSS       = input.bool(true, 'Show Market Structure')
showBOS       = input.bool(true, 'Show BOS')
showCHoCH     = input.bool(true, 'Show CHoCH')
showOB        = input.bool(true, 'Show Order Blocks')
showFVG       = input.bool(true, 'Show Fair Value Gaps')
showLiq       = input.bool(true, 'Show Liquidity Levels')
showBreakers  = input.bool(true, 'Show Breaker Blocks')
showKillzones = input.bool(false, 'Show Killzones Background')

bullColor     = input.color(#00e676, 'Bullish Color')
bearColor     = input.color(#ff1744, 'Bearish Color')
liqColor      = input.color(#9b59b6, 'Liquidity Color')

nySession     = input.session('0830-1100', 'New York (UTC-5)')
ldnSession    = input.session('0300-0600', 'London (UTC-5)')

// ───────────────────────────────
// Swing Detection
// ───────────────────────────────
upper = ta.highest(swingLen)
lower = ta.lowest(swingLen)
var int dir = 0
dir := high[swingLen] > upper ? 0 : low[swingLen] < lower ? 1 : dir[1]
ph = dir == 0 and dir[1] != 0 ? high[swingLen] : na
pl = dir == 1 and dir[1] != 1 ? low[swingLen]  : na

var float[] swingHighs = array.new_float()
var int[]   swingBarsH = array.new_int()
var float[] swingLows  = array.new_float()
var int[]   swingBarsL = array.new_int()

if not na(ph)
    array.unshift(swingHighs, ph)
    array.unshift(swingBarsH, bar_index - swingLen)
if not na(pl)
    array.unshift(swingLows, pl)
    array.unshift(swingBarsL, bar_index - swingLen)

// ───────────────────────────────
// Market Structure (MSS, BOS, CHoCH)
// ───────────────────────────────
var int trend = 0
if showMSS and array.size(swingHighs) >= 2 and array.size(swingLows) >= 2
    if close > array.get(swingHighs, 1) and trend != 1
        if showCHoCH
            label.new(array.get(swingBarsH, 1), array.get(swingHighs, 1), 'MSS',
              style=label.style_label_down, color=#00000000, textcolor=bullColor, size=size.small)
        trend := 1
    if close < array.get(swingLows, 1) and trend != -1
        if showCHoCH
            label.new(array.get(swingBarsL, 1), array.get(swingLows, 1), 'MSS',
              style=label.style_label_up, color=#00000000, textcolor=bearColor, size=size.small)
        trend := -1

    if trend == 1 and showBOS
        line.new(array.get(swingBarsH, 0), array.get(swingHighs, 0), bar_index, array.get(swingHighs, 0),
          color=bullColor, style=line.style_dashed)
    if trend == -1 and showBOS
        line.new(array.get(swingBarsL, 0), array.get(swingLows, 0), bar_index, array.get(swingLows, 0),
          color=bearColor, style=line.style_dashed)

// ───────────────────────────────
// Order Blocks
// ───────────────────────────────
if showOB and array.size(swingHighs) >= 1 and array.size(swingLows) >= 1
    if trend == 1 and close > open and close[1] < open[1]
        obTop = useBodyOB ? math.max(close[1], open[1]) : high[1]
        obBtm = useBodyOB ? math.min(close[1], open[1]) : low[1]
        box.new(bar_index[1], obTop, bar_index, obBtm, bgcolor=color.new(bullColor, 85), border_color=bullColor)
    if trend == -1 and close < open and close[1] > open[1]
        obTop = useBodyOB ? math.max(close[1], open[1]) : high[1]
        obBtm = useBodyOB ? math.min(close[1], open[1]) : low[1]
        box.new(bar_index[1], obTop, bar_index, obBtm, bgcolor=color.new(bearColor, 85), border_color=bearColor)

// ───────────────────────────────
// Fair Value Gaps (FVG)
// ───────────────────────────────
if showFVG
    bullFVG = low > high[2]
    bearFVG = high < low[2]
    plotshape(bullFVG, style=shape.triangleup, location=location.belowbar, color=bullColor, size=size.tiny)
    plotshape(bearFVG, style=shape.triangledown, location=location.abovebar, color=bearColor, size=size.tiny)
    bgcolor(bullFVG ? color.new(bullColor, 90) : na)
    bgcolor(bearFVG ? color.new(bearColor, 90) : na)

// ───────────────────────────────
// Liquidity Levels
// ───────────────────────────────
if showLiq
    for i = 1 to math.min(array.size(swingHighs), array.size(swingLows)) - 1
        if array.size(swingHighs) > i and math.abs(array.get(swingHighs, i) - array.get(swingHighs, 0)) < 10 * syminfo.mintick
            line.new(array.get(swingBarsH, i), array.get(swingHighs, i),
              array.get(swingBarsH, 0), array.get(swingHighs, 0), color=liqColor, style=line.style_dotted)
        if array.size(swingLows) > i and math.abs(array.get(swingLows, i) - array.get(swingLows, 0)) < 10 * syminfo.mintick
            line.new(array.get(swingBarsL, i), array.get(swingLows, i),
              array.get(swingBarsL, 0), array.get(swingLows, 0), color=liqColor, style=line.style_dotted)

// ───────────────────────────────
// Killzones Background
// ───────────────────────────────
if showKillzones
    inNY = not na(time('1', nySession, 'UTC-5'))
    inLDN = not na(time('1', ldnSession, 'UTC-5'))
    bgcolor(inNY ? color.new(color.orange, 90) : inLDN ? color.new(color.blue, 90) : na)

alertcondition(trend == 1 and trend[1] != 1, 'Bullish MSS', 'GQR: Bullish market structure shift')
alertcondition(trend == -1 and trend[1] != -1, 'Bearish MSS', 'GQR: Bearish market structure shift')
alertcondition(bullFVG, 'Bull FVG', 'GQR: Bullish FVG formed')
alertcondition(bearFVG, 'Bear FVG', 'GQR: Bearish FVG formed')`,
    inputs: [
      { name: 'Swing Length', type: 'integer', defaultVal: '10' },
      { name: 'Show MSS/CHoCH', type: 'boolean', defaultVal: 'true' },
      { name: 'Show OB', type: 'boolean', defaultVal: 'true' },
      { name: 'Show FVG', type: 'boolean', defaultVal: 'true' },
    ],
    alerts: ['Bullish MSS', 'Bearish MSS', 'Bull FVG', 'Bear FVG'],
  },
  {
    id: 'structure_ob_toolkit',
    name: 'GQR Structure & OB Toolkit',
    description: 'Specialized structural engine providing Multi-Market Structure Shift checks, automatic Order Block identification from exact opposite candles, and equal high/low liquidity indicators.',
    category: 'Smart Money Concepts',
    code: `//@version=5
indicator('GQR Structure & OB Toolkit [NexusDigitalArtShop]', overlay=true, max_lines_count=500, max_boxes_count=500, max_labels_count=500)

// ───────────────────────────────────────────────
// Inputs
// ───────────────────────────────────────────────
swingLen        = input.int(10, 'Swing Detection Length', minval=3)
showMSS         = input.bool(true, 'Show MSS/CHoCH')
showBOS         = input.bool(true, 'Show BOS')
showOB          = input.bool(true, 'Show Order Blocks')
showLiq         = input.bool(true, 'Show Liquidity Levels')
useBodyOB       = input.bool(true, 'OB: Use Candle Body')
maxOBs          = input.int(5, 'Max OBs Shown', minval=1, maxval=20)
bullColor       = input.color(#00e676, 'Bullish')
bearColor       = input.color(#ff1744, 'Bearish')
liqColor        = input.color(#9b59b6, 'Liquidity')

// ───────────────────────────────────────────────
// Swing detection
// ───────────────────────────────────────────────
upper = ta.highest(swingLen)
lower = ta.lowest(swingLen)

var int dir = 0
dir := high[swingLen] > upper ? 0 : low[swingLen] < lower ? 1 : dir[1]

ph = dir == 0 and dir[1] != 0 ? high[swingLen] : na
pl = dir == 1 and dir[1] != 1 ? low[swingLen]  : na

var float[] swingHighs = array.new_float()
var int[]   swingBarsH = array.new_int()
var float[] swingLows  = array.new_float()
var int[]   swingBarsL = array.new_int()

if not na(ph)
    array.unshift(swingHighs, ph)
    array.unshift(swingBarsH, bar_index - swingLen)
if not na(pl)
    array.unshift(swingLows, pl)
    array.unshift(swingBarsL, bar_index - swingLen)

// ───────────────────────────────────────────────
// Market Structure (MSS, BOS, CHoCH)
// ───────────────────────────────────────────────
var int trend = 0

if showMSS and array.size(swingHighs) >= 2 and array.size(swingLows) >= 2
    if close > array.get(swingHighs, 0) and trend != 1
        trend := 1
        label.new(bar_index, array.get(swingHighs, 0), 'MSS', style=label.style_label_down,
          color=#00000000, textcolor=bullColor, size=size.small)
    if close < array.get(swingLows, 0) and trend != -1
        trend := -1
        label.new(bar_index, array.get(swingLows, 0), 'MSS', style=label.style_label_up,
          color=#00000000, textcolor=bearColor, size=size.small)

if showBOS and array.size(swingHighs) >= 1 and array.size(swingLows) >= 1
    if trend == 1
        line.new(array.get(swingBarsH, 0), array.get(swingHighs, 0), bar_index, array.get(swingHighs, 0),
          color=bullColor, style=line.style_dashed)
    else if trend == -1
        line.new(array.get(swingBarsL, 0), array.get(swingLows, 0), bar_index, array.get(swingLows, 0),
          color=bearColor, style=line.style_dashed)

// ───────────────────────────────────────────────
// Order Blocks
// ───────────────────────────────────────────────
var float[] obTop    = array.new_float()
var float[] obBtm    = array.new_float()
var int[]   obTime   = array.new_int()
var int[]   obDir    = array.new_int()

findOrderBlock(int fromBar, int direction)=>
    float top = na, btm = na
    int   timeOB = na
    for i = fromBar to bar_index - 1
        if direction == 1
            if close[i] < open[i]
                top   := useBodyOB ? math.max(close[i], open[i]) : high[i]
                btm   := useBodyOB ? math.min(close[i], open[i]) : low[i]
                timeOB := time[i]
                break
        else
            if close[i] > open[i]
                top   := useBodyOB ? math.max(close[i], open[i]) : high[i]
                btm   := useBodyOB ? math.min(close[i], open[i]) : low[i]
                timeOB := time[i]
                break
    [top, btm, timeOB]

if showOB
    if not na(ph) and array.size(swingHighs) > 0
        startIdx = array.get(swingBarsH, 0)
        [top, btm, t] = findOrderBlock(startIdx, -1)
        if not na(top) and not na(btm)
            array.unshift(obTop, top)
            array.unshift(obBtm, btm)
            array.unshift(obTime, t)
            array.unshift(obDir, -1)
    if not na(pl) and array.size(swingLows) > 0
        startIdx = array.get(swingBarsL, 0)
        [top, btm, t] = findOrderBlock(startIdx, 1)
        if not na(top) and not na(btm)
            array.unshift(obTop, top)
            array.unshift(obBtm, btm)
            array.unshift(obTime, t)
            array.unshift(obDir, 1)

for i = 0 to math.min(array.size(obTop) - 1, maxOBs - 1)
    direction = array.get(obDir, i)
    col = direction == 1 ? bullColor : bearColor
    box.new(array.get(obTime, i), array.get(obTop, i), bar_index, array.get(obBtm, i),
      bgcolor=color.new(col, 85), border_color=col)

while array.size(obTop) > 50
    array.pop(obTop)
    array.pop(obBtm)
    array.pop(obTime)
    array.pop(obDir)

if showLiq
    tolerance = 10 * syminfo.mintick
    for i = 0 to math.min(array.size(swingHighs) - 2, 10)
        for j = i+1 to math.min(array.size(swingHighs) - 1, 10)
            if math.abs(array.get(swingHighs, i) - array.get(swingHighs, j)) <= tolerance
                line.new(array.get(swingBarsH, i), array.get(swingHighs, i),
                  array.get(swingBarsH, j), array.get(swingHighs, j),
                  color=liqColor, style=line.style_dotted)
    for i = 0 to math.min(array.size(swingLows) - 2, 10)
        for j = i+1 to math.min(array.size(swingLows) - 1, 10)
            if math.abs(array.get(swingLows, i) - array.get(swingLows, j)) <= tolerance
                line.new(array.get(swingBarsL, i), array.get(swingLows, i),
                  array.get(swingBarsL, j), array.get(swingLows, j),
                  color=liqColor, style=line.style_dotted)`,
    inputs: [
      { name: 'Swing length', type: 'integer', defaultVal: '10' },
      { name: 'Max OBs Shown', type: 'integer', defaultVal: '5' },
    ],
    alerts: ['MSS Bullish', 'MSS Bearish'],
  },
  {
    id: 'volume_delta',
    name: 'GQR Volume Delta Candles',
    description: 'Queries lower-timeframe transaction logs to resolve the exact buy and sell volumes contributing to the current candle. Computes a real-time delta score and colors candle overlays accordingly.',
    category: 'Order Flow & Volume',
    code: `//@version=5
indicator('GQR Volume Delta Candles [NexusDigitalArtShop]', overlay=true, max_labels_count=500)

// ───────────────────────────────
// Lower timeframe for delta
// ───────────────────────────────
ltfRes = input.timeframe('1', 'Lower Timeframe')
buyColor = input.color(#089981, 'Bullish Delta')
sellColor = input.color(#f23645, 'Bearish Delta')

[buyVol, sellVol] = request.security_lower_tf(syminfo.tickerid, ltfRes,
  [close > open ? volume : 0,
   close < open ? volume : 0])

totalBuy  = buyVol.sum()
totalSell = sellVol.sum()
delta     = totalBuy - totalSell
totalVol  = totalBuy + totalSell
norm      = totalVol != 0 ? delta / totalVol : 0

barcolor(norm > 0.5 ? buyColor : norm < -0.5 ? sellColor : na)

float base = na
float value = na
if norm > 0
    base  := math.min(open, close)
    value := base + math.abs(norm) * math.abs(open - close)
else if norm < 0
    base  := math.max(open, close)
    value := base - math.abs(norm) * math.abs(open - close)

plotcandle(base, value, value, base,
  color = norm > 0 ? color.new(buyColor, 70) : norm < 0 ? color.new(sellColor, 70) : na,
  wickcolor = na, bordercolor = na)`,
    inputs: [
      { name: 'Lower Timeframe', type: 'resolution', defaultVal: '"1"' },
    ],
    alerts: [],
  },
  {
    id: 'zigzag_channels',
    name: 'GQR ZigZag Channels',
    description: 'Implements high-fidelity swing channels based on multi-length ZigZag calculations. Draws upper, lower, and median target boundaries indefinitely ahead.',
    category: 'Trend & Structure',
    code: `//@version=5
indicator('GQR ZigZag Channels [NexusDigitalArtShop]', overlay=true, max_lines_count=500, max_labels_count=500)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
length        = input.int(100, 'Channel Length', minval=10)
showUpper     = input.bool(true, 'Upper Channel')
showLower     = input.bool(true, 'Lower Channel')
showMid       = input.bool(true, 'Mid Line')
upperColor    = input.color(#ff1100, 'Upper')
midColor      = input.color(#ff5d00, 'Mid')
lowerColor    = input.color(#2157f3, 'Lower')

// ───────────────────────────────
// ZigZag detection
// ───────────────────────────────
upper = ta.highest(close, length)
lower = ta.lowest(close, length)

var int os = 0
os := close[length] > upper ? 0 : close[length] < lower ? 1 : os[1]

btm = os == 1 and os[1] != 1
top = os == 0 and os[1] != 0

var float valtop = na
var float valbtm = na

if btm
    valbtm := low[length]
    valtop := high[length]
if top
    valtop := high[length]
    valbtm := low[length]

// ───────────────────────────────
// Draw channels
// ───────────────────────────────
if not na(valtop) and not na(valbtm)
    mid = math.avg(valtop, valbtm)
    diff = valtop - valbtm
    
    if showUpper
        line.new(bar_index, valtop + diff, bar_index + 50, valtop + diff, color=upperColor, style=line.style_dotted)
    if showMid
        line.new(bar_index, mid, bar_index + 50, mid, color=midColor, style=line.style_dashed)
    if showLower
        line.new(bar_index, valbtm - diff, bar_index + 50, valbtm - diff, color=lowerColor, style=line.style_dotted)`,
    inputs: [
      { name: 'Channel Length', type: 'integer', defaultVal: '100' },
      { name: 'Show Upper Channel', type: 'boolean', defaultVal: 'true' },
    ],
    alerts: [],
  },
  {
    id: 'smart_fvg',
    name: 'GQR Smart FVG (Fair Value Gap)',
    description: 'Analyzes structural candle histories to identify Fair Value Gaps (FVG) and premium/discount valuation imbalances. Projects support & resistance voids until filled.',
    category: 'Smart Money Concepts',
    code: `//@version=5
indicator('GQR Smart FVG [NexusDigitalArtShop]', overlay=true, max_boxes_count=500)

// ───────────────────────────────
// Inputs
// ───────────────────────────────
showBullish = input.bool(true, 'Show Bullish FVGs')
showBearish = input.bool(true, 'Show Bearish FVGs')
fvgColorBull = input.color(color.new(#00c853, 85), 'Bull FVG Color')
fvgColorBear = input.color(color.new(#ff1744, 85), 'Bear FVG Color')

// Detection of FVG: candle 1 high is lower than candle 3 low (Bullish)
bullFvg = low > high[2] and close[1] > high[2]
bearFvg = high < low[2] and close[1] < low[2]

if bullFvg and showBullish
    box.new(bar_index[2], low, bar_index, high[2], bgcolor=fvgColorBull, border_color=na, text="FVG +", text_size=size.small, text_color=color.new(color.white, 30))

if bearFvg and showBearish
    box.new(bar_index[2], high, bar_index, low[2], bgcolor=fvgColorBear, border_color=na, text="FVG -", text_size=size.small, text_color=color.new(color.white, 30))`,
    inputs: [
      { name: 'Show Bullish imbalance', type: 'boolean', defaultVal: 'true' },
      { name: 'Show Bearish imbalance', type: 'boolean', defaultVal: 'true' },
    ],
    alerts: [],
  }
];
