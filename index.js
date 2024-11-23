const express = require("express");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());

app.post("/generate-pdf", async (req, res) => {
  try {
    const data = req.body; 

    const doc = new PDFDocument({ size: 'A4' });

    const outputDir = path.join(__dirname, "pdf");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir); 
    const filePath = path.join(outputDir, `GeneratedDocument-${Date.now()}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const imagePath = path.join(__dirname, "static", "logo.png");
    const logoWidth = 70; 
    const logoHeight = 70; 
    const xPosition = (doc.page.width - logoWidth) / 2; 
    const yPosition = 40; 
    doc.image(imagePath, xPosition, yPosition, { width: logoWidth, height: logoHeight });

    const headerText = "Node.js Machine Test";
    const headerWidth = doc.widthOfString(headerText);
    const headerHeight = 20;
    const padding = 10; 
    const boxX = (doc.page.width - headerWidth - 2 * padding) / 2;
    const boxY = yPosition + logoHeight + 30;

    const boxWidth = doc.page.width - 80; 

    doc.rect(40, boxY, boxWidth, headerHeight + 2 * padding - 6)
      .stroke(); 

    doc.fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#1C325B')
      .text(headerText, 60 + padding, boxY + padding, { align: 'center' });

    doc.fillColor('black');

    const dataStartY = boxY + headerHeight + 40; 
    doc.fontSize(12).font('Helvetica');
    
    Object.keys(data).forEach((key, index) => {
      const bulletX = 40;
      const textX = 60;  
      const lineY = dataStartY + (index * 20); 
      
      doc.circle(bulletX, lineY + 6, 2).fill(); 
      
      doc.text(`${key}: ${data[key]}`, textX, lineY);
    });

    doc.end();

    stream.on("finish", () => {
      res.json({ success: true, filePath });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use("/static", express.static(path.join(__dirname, "static")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
