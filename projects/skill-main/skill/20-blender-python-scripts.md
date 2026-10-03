# Skill: Blender Python Scripts

**Source:** پرامپت ها.md (Blender Python Prompts)

## Core Techniques

### 1. Role-Based Prompting
```
"Act as a Senior [Specialty] and Blender VFX Technical Director
specializing in Python scripting (bpy)"
```

### 2. Self-Contained Constraint
- No external textures, models, or plugins
- All materials procedural
- All geometry generated via code
- Collection-based organization

### 3. Cycles Render Configuration
```python
bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.device = 'GPU'
bpy.context.scene.cycles.samples = 128
bpy.context.scene.render.film_transparent = False
# OpenImageDenoise
bpy.context.scene.cycles.use_denoising = True
# Motion Blur
bpy.context.scene.render.motion_blur = True
bpy.context.scene.render.shutter = 0.5
```

### 4. PBR Material Node Construction
```python
def create_metal_material(name, base_color, metallic=1.0, roughness=0.3):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    return mat
```

### 5. Animation Keyframing via Code
```python
# 120-frame firing cycle
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 120

# Pre-Fire (frames 1-30)
obj.location.z = 0
obj.keyframe_insert(data_path="location", frame=1)

# Ignition/Recoil (frames 31-45)
obj.location.z = -0.02
obj.keyframe_insert(data_path="location", frame=35)

# Return to Battery (frames 46-120)
obj.location.z = 0
obj.keyframe_insert(data_path="location", frame=60)
```

### 6. Particle System Design
```python
# Rain particles
ps = bpy.data.particles.new("Rain")
ps.count = 10000
ps.frame_start = 1
ps.frame_end = 250
ps.lifetime = 50
ps.effector_weights.gravity = 1
```

### 7. Scene Organization
```python
# Create collections
collection = bpy.data.collections.new("Environment")
bpy.context.scene.collection.children.link(collection)

# Move objects to collection
for obj in objects:
    for col in obj.users_collection:
        col.objects.unlink(obj)
    collection.objects.link(obj)
```

### 8. Cinematic Camera Choreography
- 24mm wide establishing shot
- 50mm interior detail
- 35mm drone flyover
- 85mm telephoto portrait
- Keyframe camera position/rotation per shot

## Application to Our Game
- Export Blender scenes to game engine via FBX
- Use PBR material patterns for game shaders
- Apply cinematic camera techniques for cutscenes
- Generate 3D assets procedurally via Python
