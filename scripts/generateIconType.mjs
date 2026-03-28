import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Tạo __dirname tương đương cho ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateIconTypes = () => {
  // Đọc file selection.json
  const selectionPath = path.join(
    __dirname,
    "../src/assets/icomoon/selection.json"
  );
  const selectionContent = fs.readFileSync(selectionPath, "utf-8");
  const selection = JSON.parse(selectionContent);

  // Lấy danh sách tên icon từ selection.json
  const iconNames = selection.icons.map((icon) => `'${icon.properties.name}'`);

  // Tạo nội dung file types.ts
  const typesContent = `export type IconName = ${iconNames.join(
    " | "
  )};\n\nexport type IconProps = {
  color?: string;
  size: string | number;
  icon: IconName;
  className?: string;
};`;

  // Ghi vào file types.ts
  const typesPath = path.join(__dirname, "../src/components/Icons/types.ts");
  fs.writeFileSync(typesPath, typesContent);

  console.log("✅ Icon types generated successfully!");
};

generateIconTypes();
