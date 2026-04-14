import base64
import os
import sys

def convert_image_to_base64(image_path):
    """
    Converts an image file to a base64 string.
    """
    try:
        if not os.path.exists(image_path):
            print(f"❌ Error: File '{image_path}' not found.")
            return

        with open(image_path, "rb") as image_file:
            # Read image and encode to base64
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Get file extension to determine mime type
            ext = os.path.splitext(image_path)[1].lower().replace('.', '')
            if ext == 'jpg': ext = 'jpeg'
            
            # Format as Data URL
            base64_data = f"data:image/{ext};base64,{encoded_string}"
            
            # Output the result
            output_file = "image_base64.txt"
            with open(output_file, "w") as f:
                f.write(base64_data)
            
            print(f"✅ Success! Base64 string saved to '{output_file}'")
            print("-" * 30)
            print(base64_data[:100] + "...") # Print first 100 chars
            print("-" * 30)
            
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("💡 Usage: python image_to_base64.py <path_to_image>")
        # Example if no argument is provided
        # convert_image_to_base64("example.jpg")
    else:
        convert_image_to_base64(sys.argv[1])
