import torch
import os
from ultralytics import YOLO
import numpy as np

def check_model_file(model_path):
    """检查模型文件质量"""
    print(f"\n🔍 检查模型文件: {model_path}")
    print(f"文件存在: {os.path.exists(model_path)}")
    
    if not os.path.exists(model_path):
        return False
    
    # 检查文件大小
    file_size = os.path.getsize(model_path) / 1024 / 1024
    print(f"文件大小: {file_size:.2f} MB")
    
    # 检查内部结构
    try:
        checkpoint = torch.load(model_path, map_location='cpu', weights_only=False)
        print("✅ PyTorch加载成功")
        
        # 检查关键组件
        model_exists = checkpoint.get('model') is not None
        ema_exists = checkpoint.get('ema') is not None
        
        print(f"主要模型权重: {'✅' if model_exists else '❌'}")
        print(f"EMA权重: {'✅' if ema_exists else '❌'}")
        
        # 检查训练信息
        if 'epoch' in checkpoint:
            print(f"训练轮数: {checkpoint['epoch']}")
        if 'best_fitness' in checkpoint:
            print(f"最佳准确率: {checkpoint['best_fitness']}")
        
        # 测试模型推理能力
        print("🧪 测试模型推理...")
        model = YOLO(model_path)
        test_img = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
        results = model(test_img, conf=0.25, iou=0.45, verbose=False)
        
        if len(results) > 0 and results[0].boxes is not None and len(results[0].boxes) > 0:
            boxes = results[0].boxes
            confidences = boxes.conf.cpu().numpy()
            print(f"✅ 推理测试成功 - 检测到 {len(boxes)} 个目标")
            print(f"   置信度范围: {confidences.min():.3f} - {confidences.max():.3f}")
            
            # 显示检测到的类别
            for i, (cls, conf) in enumerate(zip(boxes.cls, boxes.conf)):
                class_id = int(cls)
                class_name = f"类别{class_id}" if class_id >= 5 else ["normal", "Lightweight and portable", "watery diarrhoea", "constipation", "parasitic infection"][class_id]
                print(f"   目标{i+1}: {class_name} 置信度{float(conf):.3f}")
            
            return True
        else:
            print("❌ 推理测试失败 - 未检测到目标")
            return False
            
    except Exception as e:
        print(f"❌ 检查失败: {e}")
        import traceback
        traceback.print_exc()
        return False

# 检查当前目录下的模型文件
current_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(current_dir, "..", "models")

print(f"当前目录: {current_dir}")
print(f"模型目录: {models_dir}")

model_files = [
    os.path.join(models_dir, "best.pt"),
    os.path.join(models_dir, "best_fixed.pt"),
]

# 添加您提到过的其他可能位置
other_locations = [
    "C:/Users/user/cathealth-app/backend/python/models/best.pt",
    "C:/Users/user/cathealth-app/backend/python/models/best_fixed.pt",
]

# 检查所有可能的文件
all_model_files = model_files + other_locations

found_good_model = False
for model_file in all_model_files:
    if os.path.exists(model_file):
        print(f"\n{'='*50}")
        print(f"检查: {model_file}")
        print(f"{'='*50}")
        quality = check_model_file(model_file)
        if quality:
            print(f"🎉 {model_file} 是高质量的模型文件！")
            found_good_model = True
            # 可以在这里选择是否继续检查其他文件
            # break  # 取消注释这句如果只想找到第一个好模型就停止
    else:
        print(f"📁 {model_file} 不存在")

if not found_good_model:
    print(f"\n❌ 没有找到可用的高质量模型文件")
    print(f"请将您其他训练成功的 best.pt 文件复制到: {models_dir}")