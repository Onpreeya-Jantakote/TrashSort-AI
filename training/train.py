import os
import shutil
from pathlib import Path
from ultralytics import YOLO
import torch

def main():
    print("=" * 60)
    print("TrashSort AI — YOLOv8 Custom Waste Detection Training")
    print("=" * 60)

    # 1. Device configuration
    use_cuda = torch.cuda.is_available()
    device = 0 if use_cuda else "cpu"
    device_name = torch.cuda.get_device_name(0) if use_cuda else "CPU"
    print(f"Hardware Target: Device {device} ({device_name})")

    # 2. Dataset configuration check
    base_dir = Path(__file__).resolve().parent
    dataset_yaml = base_dir / "dataset" / "data.yaml"
    
    if not dataset_yaml.exists():
        print(f"Error: {dataset_yaml} not found!")
        print("Please run 'python training/prepare_dataset.py' first.")
        return

    # Use forward slashes for cross-platform compatibility
    yaml_path_str = str(dataset_yaml).replace("\\", "/")

    # 3. Initialize YOLOv8 Nano model
    # We transfer-learn from pre-trained weights for faster convergence
    print("\n[Step 1/3] Loading YOLOv8n base model...")
    model = YOLO("yolov8n.pt")

    # 4. Train the model
    # Hyperparameters optimized for laptop GPU (RTX 4050 6GB):
    # - batch=16: Safe memory footprint (~2.5GB VRAM)
    # - imgsz=640: Standard YOLO resolution matching our frontend preprocessor
    # - epochs=25: High convergence with early stopping
    print("\n[Step 2/3] Starting training loop...")
    results = model.train(
        data=yaml_path_str,
        epochs=25,
        imgsz=640,
        batch=16,
        device=device,
        workers=2,
        project=str(base_dir / "runs" / "detect").replace("\\", "/"),
        name="waste_yolov8n",
        exist_ok=True,
        patience=8,
        save=True,
        plots=True,
        verbose=True
    )

    # 5. Export best model to ONNX format
    print("\n[Step 3/3] Exporting best model to ONNX...")
    best_pt_path = base_dir / "runs" / "detect" / "waste_yolov8n" / "weights" / "best.pt"
    if not best_pt_path.exists():
        best_pt_path = Path(model.trainer.best)

    best_model = YOLO(str(best_pt_path))
    exported_onnx = best_model.export(
        format="onnx",
        imgsz=640,
        opset=12,
        simplify=True
    )

    # 6. Copy exported ONNX model directly to Next.js public directory
    public_model_dest = base_dir.parent / "public" / "models" / "waste_yolov8n.onnx"
    public_model_dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(exported_onnx, public_model_dest)

    print("\n" + "=" * 60)
    print(" Training & Export Completed Successfully!")
    print(f"• PyTorch Best Weights: {best_pt_path}")
    print(f"• Exported ONNX Model:  {exported_onnx}")
    print(f"• Deployed to Frontend: {public_model_dest}")
    print("=" * 60)

if __name__ == "__main__":
    main()
