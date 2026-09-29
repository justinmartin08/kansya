import math
import os
from PIL import Image, ImageDraw, ImageFilter

def create_master_icon(size=1024):
    # Create image with RGBA
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    scale = size / 1024.0
    cx, cy = size // 2, int(size * 0.53) # Centered with slight downward offset for sprout
    coin_r = int(320 * scale)
    
    # 1. Background: Deep obsidian rounded square or circle with vignette
    for r in range(size // 2, 0, -2):
        # Radial gradient from dark navy-slate to deep obsidian
        factor = r / (size / 2)
        red = int(11 * (1 - factor) + 5 * factor)
        green = int(17 * (1 - factor) + 8 * factor)
        blue = int(30 * (1 - factor) + 15 * factor)
        draw.ellipse([cx - r, cx - r, cx + r, cx + r], fill=(red, green, blue, 255))
        
    # 2. Ambient Golden Glow behind coin
    glow_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_r = int(coin_r * 1.35)
    glow_draw.ellipse([cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r], fill=(245, 158, 11, 70))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(int(50 * scale)))
    img.alpha_composite(glow_img)
    draw = ImageDraw.Draw(img)
    
    # 3. Drop Shadow for Coin
    shadow_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_img)
    shadow_y = cy + int(30 * scale)
    shadow_draw.ellipse([cx - int(coin_r * 1.05), shadow_y - int(coin_r * 0.4), cx + int(coin_r * 1.05), shadow_y + int(coin_r * 0.4)], fill=(0, 0, 0, 160))
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(int(35 * scale)))
    img.alpha_composite(shadow_img)
    draw = ImageDraw.Draw(img)
    
    # 4. Outer Metallic Coin Rim (Gold Gradient)
    # Beveled rim
    rim_thickness = int(32 * scale)
    for i in range(rim_thickness):
        t = i / rim_thickness
        r = coin_r - i
        # Simulate angular light (top-left highlight, bottom-right shadow)
        gold_r = int(254 * (1 - t) + 180 * t)
        gold_g = int(240 * (1 - t) + 120 * t)
        gold_b = int(138 * (1 - t) + 20 * t)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(gold_r, gold_g, gold_b, 255))
        
    # 5. Inner Recessed Coin Face
    face_r = coin_r - rim_thickness
    for r in range(face_r, 0, -2):
        t = r / face_r
        # Radiant radial gold face
        red = int(251 * t + 180 * (1 - t))
        green = int(191 * t + 100 * (1 - t))
        blue = int(36 * t + 10 * (1 - t))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(red, green, blue, 255))
        
    # Concentric inner milled groove
    groove_r = int(face_r * 0.88)
    draw.ellipse([cx - groove_r, cy - groove_r, cx + groove_r, cy + groove_r], outline=(254, 240, 138, 180), width=max(1, int(3 * scale)))
    
    # 6. Embossed Philippine Peso (₱) Symbol
    peso_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(peso_img)
    
    p_x = cx - int(45 * scale)
    p_y = cy - int(105 * scale)
    stem_w = int(36 * scale)
    stem_h = int(210 * scale)
    loop_w = int(120 * scale)
    loop_h = int(125 * scale)
    bar_w = int(155 * scale)
    bar_h = int(18 * scale)
    
    def draw_peso(offset_x, offset_y, color):
        ox = p_x + offset_x
        oy = p_y + offset_y
        # Stem
        p_draw.rounded_rectangle([ox, oy, ox + stem_w, oy + stem_h], radius=int(6*scale), fill=color)
        # Upper Loop
        p_draw.rounded_rectangle([ox, oy, ox + loop_w, oy + loop_h], radius=int(24*scale), fill=color)
        # Inner Loop Cutout (if not shadow)
        inner_m = int(24 * scale)
        p_draw.rounded_rectangle([ox + stem_w, oy + inner_m, ox + loop_w - inner_m, oy + loop_h - inner_m], radius=int(12*scale), fill=(0, 0, 0, 0))
        # Dual Crossbars
        p_draw.rounded_rectangle([ox - int(24*scale), oy + int(42*scale), ox - int(24*scale) + bar_w, oy + int(42*scale) + bar_h], radius=int(5*scale), fill=color)
        p_draw.rounded_rectangle([ox - int(24*scale), oy + int(76*scale), ox - int(24*scale) + bar_w, oy + int(76*scale) + bar_h], radius=int(5*scale), fill=color)

    # 3D Shadow layer (drop shadow)
    draw_peso(int(3 * scale), int(6 * scale), (120, 53, 15, 230))
    # 3D Specular Highlight layer
    draw_peso(int(-2 * scale), int(-3 * scale), (255, 255, 255, 220))
    # Main Gold Embossed Face
    draw_peso(0, 0, (254, 240, 138, 255))
    
    img.alpha_composite(peso_img)
    draw = ImageDraw.Draw(img)
    
    # 7. Kansya Sprout Emerging / Blooming from the Coin Top
    sprout_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(sprout_img)
    
    sprout_base_x = cx
    sprout_base_y = cy - coin_r + int(10 * scale)
    
    # Stem: curved green stem
    stem_points = [
        (sprout_base_x - int(6*scale), sprout_base_y),
        (sprout_base_x + int(6*scale), sprout_base_y),
        (sprout_base_x + int(10*scale), sprout_base_y - int(75*scale)),
        (sprout_base_x - int(10*scale), sprout_base_y - int(75*scale)),
    ]
    s_draw.polygon(stem_points, fill=(74, 222, 128, 255))
    
    # Left Leaf (curved organic ellipse)
    left_leaf = Image.new('RGBA', (int(260*scale), int(180*scale)), (0, 0, 0, 0))
    ll_draw = ImageDraw.Draw(left_leaf)
    ll_draw.ellipse([0, 0, int(240*scale), int(140*scale)], fill=(134, 239, 172, 255))
    ll_draw.ellipse([int(15*scale), int(15*scale), int(220*scale), int(120*scale)], fill=(74, 222, 128, 255))
    # Rotate left leaf ~ -35 deg
    left_leaf = left_leaf.rotate(32, expand=True)
    sprout_img.alpha_composite(left_leaf, (sprout_base_x - int(195*scale), sprout_base_y - int(180*scale)))
    
    # Right Leaf (curved organic ellipse)
    right_leaf = Image.new('RGBA', (int(260*scale), int(180*scale)), (0, 0, 0, 0))
    rl_draw = ImageDraw.Draw(right_leaf)
    rl_draw.ellipse([0, 0, int(240*scale), int(140*scale)], fill=(134, 239, 172, 255))
    rl_draw.ellipse([int(15*scale), int(15*scale), int(220*scale), int(120*scale)], fill=(34, 197, 94, 255))
    # Rotate right leaf ~ 35 deg
    right_leaf = right_leaf.rotate(-32, expand=True)
    sprout_img.alpha_composite(right_leaf, (sprout_base_x - int(30*scale), sprout_base_y - int(185*scale)))
    
    img.alpha_composite(sprout_img)
    draw = ImageDraw.Draw(img)
    
    # 8. Diamond Sparkle Stars (✦)
    def draw_star(sx, sy, rad, color=(255, 255, 255, 240)):
        star_pts = [
            (sx, sy - rad),
            (sx + int(rad * 0.28), sy - int(rad * 0.28)),
            (sx + rad, sy),
            (sx + int(rad * 0.28), sy + int(rad * 0.28)),
            (sx, sy + rad),
            (sx - int(rad * 0.28), sy + int(rad * 0.28)),
            (sx - rad, sy),
            (sx - int(rad * 0.28), sy - int(rad * 0.28)),
        ]
        draw.polygon(star_pts, fill=color)
        draw.ellipse([sx - int(rad * 0.2), sy - int(rad * 0.2), sx + int(rad * 0.2), sy + int(rad * 0.2)], fill=(255, 255, 255, 255))

    # Top right sparkle
    draw_star(cx + int(coin_r * 0.82), cy - int(coin_r * 0.75), int(42 * scale), (255, 255, 240, 255))
    # Left rim sparkle
    draw_star(cx - int(coin_r * 0.88), cy - int(coin_r * 0.2), int(26 * scale), (254, 240, 138, 230))
    # Sprout tip sparkle
    draw_star(cx, sprout_base_y - int(170 * scale), int(28 * scale), (134, 239, 172, 240))
    
    return img

def create_adaptive_foreground(size=432):
    # Adaptive icon foreground has coin + sprout on transparent background
    master = create_master_icon(1024)
    # Crop to just the coin and sprout (leave margins for mask)
    scaled = master.resize((size, size), Image.Resampling.LANCZOS)
    return scaled

if __name__ == '__main__':
    print("Generating Kansya Master Icon (1024x1024)...")
    master_1024 = create_master_icon(1024)
    master_1024.save('assets/icon.png', 'PNG')
    
    print("Generating Adaptive Icons (432x432)...")
    fg_432 = master_1024.resize((432, 432), Image.Resampling.LANCZOS)
    fg_432.save('assets/android-icon-foreground.png', 'PNG')
    
    # Solid background for adaptive icon
    bg_432 = Image.new('RGB', (432, 432), (9, 13, 22))
    bg_432.save('assets/android-icon-background.png', 'PNG')
    
    # Monochrome icon (greyscale)
    mono_432 = master_1024.convert('L').resize((432, 432), Image.Resampling.LANCZOS)
    mono_432.save('assets/android-icon-monochrome.png', 'PNG')
    
    # Favicon and splash
    fav_64 = master_1024.resize((64, 64), Image.Resampling.LANCZOS)
    fav_64.save('assets/favicon.png', 'PNG')
    
    splash_256 = master_1024.resize((256, 256), Image.Resampling.LANCZOS)
    splash_256.save('assets/splash-icon.png', 'PNG')
    
    # Android Mipmap dimensions
    mipmaps = {
        'mdpi': 48,
        'hdpi': 72,
        'xhdpi': 96,
        'xxhdpi': 144,
        'xxxhdpi': 192
    }
    
    res_base = 'android/app/src/main/res'
    for name, s in mipmaps.items():
        folder = os.path.join(res_base, f'mipmap-{name}')
        os.makedirs(folder, exist_ok=True)
        
        # Standard icon
        icon_s = master_1024.resize((s, s), Image.Resampling.LANCZOS)
        icon_s.save(os.path.join(folder, 'ic_launcher.png'), 'PNG')
        icon_s.save(os.path.join(folder, 'ic_launcher_round.png'), 'PNG')
        
        # Foreground for adaptive
        fg_s = fg_432.resize((s, s), Image.Resampling.LANCZOS)
        fg_s.save(os.path.join(folder, 'ic_launcher_foreground.png'), 'PNG')

        # Background for adaptive
        bg_s = bg_432.resize((s, s), Image.Resampling.LANCZOS)
        bg_s.save(os.path.join(folder, 'ic_launcher_background.png'), 'PNG')

        # Monochrome for adaptive
        mono_s = mono_432.resize((s, s), Image.Resampling.LANCZOS)
        mono_s.save(os.path.join(folder, 'ic_launcher_monochrome.png'), 'PNG')
        
        # Splashscreen logo in drawables
        drawable_folder = os.path.join(res_base, f'drawable-{name}')
        os.makedirs(drawable_folder, exist_ok=True)
        splash_s = master_1024.resize((s * 2, s * 2), Image.Resampling.LANCZOS)
        splash_s.save(os.path.join(drawable_folder, 'splashscreen_logo.png'), 'PNG')
        print(f"Generated mipmap and drawable for {name} ({s}x{s})")
        
    print("ALL APP ICONS & MIPMAPS GENERATED SUCCESSFULLY!")
