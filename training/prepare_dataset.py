import os
import json
import zipfile
import urllib.request
from pathlib import Path

# Paths configuration
BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"
IMAGES_DIR = DATASET_DIR / "images"
LABELS_DIR = DATASET_DIR / "labels"

# Hugging Face dataset URLs (Roboflow Garbage Classification)
DATASET_URLS = {
    "train": "https://huggingface.co/datasets/keremberke/garbage-object-detection/resolve/main/data/train.zip",
    "val": "https://huggingface.co/datasets/keremberke/garbage-object-detection/resolve/main/data/valid.zip"
}

CLASSES = [
    "biodegradable",
    "cardboard",
    "glass",
    "metal",
    "paper",
    "plastic"
]

def download_file(url: str, dest_path: Path):
    """Download a file with progress reporting."""
    print(f"Downloading {dest_path.name} from Hugging Face...")
    
    def report_progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        if total_size > 0:
            percent = downloaded / total_size * 100
            mb_down = downloaded / (1024 * 1024)
            mb_total = total_size / (1024 * 1024)
            print(f"\r  Progress: {percent:.1f}% ({mb_down:.1f} MB / {mb_total:.1f} MB)", end="", flush=True)
            
    urllib.request.urlretrieve(url, dest_path, reporthook=report_progress)
    print()  # New line after completion

def convert_coco_to_yolo(zip_file_path: Path, split_name: str):
    """
    Extract images and convert COCO annotations to YOLO format.
    YOLO format per line: <class_id> <x_center> <y_center> <width> <height>
    All coordinates normalized to [0.0, 1.0].
    """
    print(f"\nProcessing '{split_name}' split...")
    
    split_images_dir = IMAGES_DIR / split_name
    split_labels_dir = LABELS_DIR / split_name
    split_images_dir.mkdir(parents=True, exist_ok=True)
    split_labels_dir.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(zip_file_path, "r") as zf:
        # Read COCO JSON annotation file
        coco_raw = zf.read("_annotations.coco.json")
        coco_data = json.loads(coco_raw.decode("utf-8"))

        # Map image_id -> image details
        image_map = {img["id"]: img for img in coco_data["images"]}

        # Group annotations by image_id
        annotations_by_image = {}
        for ann in coco_data["annotations"]:
            img_id = ann["image_id"]
            if img_id not in annotations_by_image:
                annotations_by_image[img_id] = []
            annotations_by_image[img_id].append(ann)

        # Extract images and write YOLO label txt files
        total_images = len(coco_data["images"])
        print(f"Extracting {total_images} images and creating YOLO label files...")

        for idx, img_info in enumerate(coco_data["images"]):
            file_name = img_info["file_name"]
            img_w = img_info["width"]
            img_h = img_info["height"]

            # Extract image file
            target_img_path = split_images_dir / file_name
            if not target_img_path.exists():
                with open(target_img_path, "wb") as f_out:
                    f_out.write(zf.read(file_name))

            # Generate YOLO label file
            txt_name = Path(file_name).stem + ".txt"
            target_txt_path = split_labels_dir / txt_name
            
            lines = []
            img_annotations = annotations_by_image.get(img_info["id"], [])
            for ann in img_annotations:
                cat_id = ann["category_id"]
                x_min, y_min, box_w, box_h = ann["bbox"]

                # Convert to normalized YOLO format
                x_center = (x_min + box_w / 2.0) / img_w
                y_center = (y_min + box_h / 2.0) / img_h
                norm_w = box_w / img_w
                norm_h = box_h / img_h

                # Clamp values to [0.0, 1.0] for safety
                x_center = max(0.0, min(1.0, x_center))
                y_center = max(0.0, min(1.0, y_center))
                norm_w = max(0.0, min(1.0, norm_w))
                norm_h = max(0.0, min(1.0, norm_h))

                lines.append(f"{cat_id} {x_center:.6f} {y_center:.6f} {norm_w:.6f} {norm_h:.6f}")

            with open(target_txt_path, "w", encoding="utf-8") as f_txt:
                f_txt.write("\n".join(lines))

            if (idx + 1) % 1000 == 0 or (idx + 1) == total_images:
                print(f"  Processed {idx + 1}/{total_images} images...")

    print(f"Finished processing '{split_name}'.")

def create_yaml_config():
    """Create data.yaml for YOLOv8 training."""
    # Use forward slashes for cross-platform compatibility
    dataset_abs_path = str(DATASET_DIR.resolve()).replace("\\", "/")
    
    yaml_content = f"""# Waste Detection Dataset configuration for YOLOv8
path: {dataset_abs_path}
train: images/train
val: images/val

# Class names
names:
"""
    for idx, name in enumerate(CLASSES):
        yaml_content += f"  {idx}: {name}\n"

    yaml_path = DATASET_DIR / "data.yaml"
    with open(yaml_path, "w", encoding="utf-8") as f:
        f.write(yaml_content)

    print(f"\nCreated data.yaml at: {yaml_path}")

def main():
    print("=" * 60)
    print("TrashSort AI — Dataset Preparation (YOLOv8 Format)")
    print("=" * 60)

    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    temp_dir = BASE_DIR / "temp_downloads"
    temp_dir.mkdir(parents=True, exist_ok=True)

    # Download and process each split
    for split, url in DATASET_URLS.items():
        zip_path = temp_dir / f"{split}.zip"
        if not zip_path.exists():
            download_file(url, zip_path)
        else:
            print(f"Archive already downloaded: {zip_path.name}")

        convert_coco_to_yolo(zip_path, split)

    # Create YAML config
    create_yaml_config()

    # Clean up zip archives to save disk space
    print("\nCleaning up temporary zip archives...")
    for split in DATASET_URLS:
        zip_path = temp_dir / f"{split}.zip"
        if zip_path.exists():
            zip_path.unlink()
    if temp_dir.exists():
        temp_dir.rmdir()

    print("\n Dataset preparation completed successfully!")
    print(f"Dataset root: {DATASET_DIR}")

if __name__ == "__main__":
    main()
