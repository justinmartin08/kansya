import os
from PIL import Image, ImageDraw
import numpy as np

def generate_all_icons():
    # 1. Load clean extracted foreground
    fg_1024 = Image.open('test_extracted_fg.png')
    
    # Target scale for 432x432 adaptive foreground:
    # Subject fits strictly within radius 134px (safe circle is radius 142.5px ~ 66%)
    target_scale = 0.336
    scaled_w = int(1024 * target_scale)
    scaled_h = int(1024 * target_scale)
    scaled_fg = fg_1024.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)
    
    # 432x432 Adaptive Foreground (Transparent BG)
    fg_432 = Image.new('RGBA', (432, 432), (0, 0, 0, 0))
    paste_x = (432 - scaled_w) // 2
    paste_y = (432 - scaled_h) // 2
    fg_432.alpha_composite(scaled_fg, (paste_x, paste_y))
    
    # Verify safe margins:
    arr = np.array(fg_432)
    alpha = arr[:, :, 3]
    y_idx, x_idx = np.where(alpha > 10)
    cy, cx = 216, 216
    dists = np.sqrt((x_idx - cx)**2 + (y_idx - cy)**2)
    max_d = dists.max()
    print(f"Adaptive Foreground Max Distance from Center: {max_d:.2f}px (Safe radius is 142.5px)")
    assert max_d <= 135, f"Icon must be within 135px radius, got {max_d}"
    
    # 432x432 Adaptive Background
    bg_432 = Image.new('RGBA', (432, 432), (15, 23, 42, 255))
    
    # 432x432 Adaptive Monochrome
    mono_432 = Image.new('RGBA', (432, 432), (0, 0, 0, 0))
    fg_l = fg_432.convert('L')
    mono_432.paste(fg_l, (0, 0), fg_432)
    
    # Save adaptive root assets
    os.makedirs('assets', exist_ok=True)
    fg_432.save('assets/android-icon-foreground.png', 'PNG')
    bg_432.save('assets/android-icon-background.png', 'PNG')
    mono_432.save('assets/android-icon-monochrome.png', 'PNG')
    
    # 1024x1024 Master Icon (Composited over #0F172A)
    # Master scale for 1024x1024: subject occupies center ~640px height
    master_scale = 640 / 774
    master_w = int(1024 * master_scale)
    master_h = int(1024 * master_scale)
    master_scaled = fg_1024.resize((master_w, master_h), Image.Resampling.LANCZOS)
    
    icon_1024 = Image.new('RGBA', (1024, 1024), (15, 23, 42, 255))
    m_paste_x = (1024 - master_w) // 2
    m_paste_y = (1024 - master_h) // 2
    icon_1024.alpha_composite(master_scaled, (m_paste_x, m_paste_y))
    icon_1024.save('assets/icon.png', 'PNG')
    icon_1024.save('assets/splash-icon.png', 'PNG')
    
    # Favicon 64x64
    fav_64 = icon_1024.resize((64, 64), Image.Resampling.LANCZOS)
    fav_64.save('assets/favicon.png', 'PNG')
    
    # Full composited 432x432 for round/standard icons
    full_comp_432 = Image.alpha_composite(bg_432, fg_432)
    
    # Mipmap densities
    mipmaps = {
        'mdpi': 48,
        'hdpi': 72,
        'xhdpi': 96,
        'xxhdpi': 144,
        'xxxhdpi': 192,
    }
    
    res_base = 'android/app/src/main/res'
    for name, s in mipmaps.items():
        folder = os.path.join(res_base, f'mipmap-{name}')
        os.makedirs(folder, exist_ok=True)
        
        # Standard icon
        full_comp_432.resize((s, s), Image.Resampling.LANCZOS).save(os.path.join(folder, 'ic_launcher.png'), 'PNG')
        full_comp_432.resize((s, s), Image.Resampling.LANCZOS).save(os.path.join(folder, 'ic_launcher_round.png'), 'PNG')
        
        # Adaptive layers
        fg_432.resize((s, s), Image.Resampling.LANCZOS).save(os.path.join(folder, 'ic_launcher_foreground.png'), 'PNG')
        bg_432.resize((s, s), Image.Resampling.LANCZOS).save(os.path.join(folder, 'ic_launcher_background.png'), 'PNG')
        mono_432.resize((s, s), Image.Resampling.LANCZOS).save(os.path.join(folder, 'ic_launcher_monochrome.png'), 'PNG')
        
        # Splashscreen drawable
        draw_folder = os.path.join(res_base, f'drawable-{name}')
        os.makedirs(draw_folder, exist_ok=True)
        icon_1024.resize((s * 2, s * 2), Image.Resampling.LANCZOS).save(os.path.join(draw_folder, 'splashscreen_logo.png'), 'PNG')
        print(f"Generated mipmap and drawable for {name} ({s}x{s})")
        
    print("ALL APP ICONS & MIPMAPS GENERATED WITH CLEAN 66% SAFE MARGINS!")

if __name__ == '__main__':
    generate_all_icons()
