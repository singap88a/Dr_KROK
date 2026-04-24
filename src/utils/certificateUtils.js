import jsPDF from "jspdf";

export const formatProfessionalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const calculateGrade = (percentage) => {
  if (percentage >= 90) return "Excellent";
  if (percentage >= 80) return "Very Good";
  if (percentage >= 70) return "Good";
  if (percentage >= 65) return "Pass";
  return "Fail";
};

export const extractColorFromImage = () => {
  return "#c2a10d"; // Default gold-ish color from the template
};

export const generateProfessionalCertificatePDF = ({
  course,
  userName,
  percentage,
  grade,
  studentNameColor = "#c2a10d",
  certificateImage = "/certificate_1.jpg",
  t = (key, def) => def
}) => {
  return new Promise((resolve, reject) => {
    try {
      const pdf = new jsPDF("landscape", "mm", "a4");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = certificateImage;

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 297 * 2;
          canvas.height = 210 * 2;
          
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Student Name
          ctx.fillStyle = studentNameColor;
          ctx.font = "bold 32px 'Times New Roman', serif";
          ctx.fillText(userName.toUpperCase(), canvas.width / 2, 220);

          // Course Title
          ctx.fillStyle = "#333333";
          ctx.font = "bold 16px 'Times New Roman', serif";
          
          const courseTitle = course?.title || t("courses.courseTitle", "Course Title");
          const maxWidth = 400;
          
          if (ctx.measureText(courseTitle).width > maxWidth) {
            const words = courseTitle.split(' ');
            let line1 = '';
            let line2 = '';
            
            for (let word of words) {
              if (ctx.measureText(line1 + ' ' + word).width <= maxWidth) {
                line1 += (line1 ? ' ' : '') + word;
              } else {
                line2 += (line2 ? ' ' : '') + word;
              }
            }
            
            ctx.fillText(line1, canvas.width / 2, 260);
            if (line2) {
              ctx.fillText(line2, canvas.width / 2, 275);
            }
          } else {
            ctx.fillText(courseTitle, canvas.width / 2, 265);
          }

          // Grade
          if (grade) {
            ctx.fillStyle = "#2c5aa0";
            ctx.font = "italic 18px 'Times New Roman', serif";
            ctx.fillText(`Grade: ${grade}`, canvas.width / 2, 295);
          }

          // Percentage
          ctx.fillStyle = studentNameColor;
          ctx.font = "bold 18px 'Times New Roman', serif";
          ctx.fillText(`${Math.round(percentage)}%`, canvas.width / 2, 315);

          // Footer - Date and Signature
          const profDate = formatProfessionalDate();
          
          ctx.textAlign = "center";
          ctx.fillStyle = "#000000";
          ctx.font = "bold 14px 'Arial', 'Helvetica', sans-serif";
          
          ctx.fillText(profDate, 120, 360);
          ctx.beginPath();
          ctx.moveTo(80, 370);
          ctx.lineTo(160, 370);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.font = "12px 'Arial', 'Helvetica', sans-serif";
          ctx.fillText("DATE", 120, 385);

          ctx.textAlign = "center";
          ctx.font = "bold 14px 'Arial', 'Helvetica', sans-serif";
          ctx.fillText("Dr. KROK", canvas.width - 120, 360);
          ctx.beginPath();
          ctx.moveTo(canvas.width - 160, 370);
          ctx.lineTo(canvas.width - 80, 370);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.font = "12px 'Arial', 'Helvetica', sans-serif";
          ctx.fillText("SIGNATURE", canvas.width - 120, 385);

          const highResImage = canvas.toDataURL("image/jpeg", 1.0);
          pdf.addImage(highResImage, "JPEG", 0, 0, 297, 210);
          resolve(pdf.output("blob"));
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error("Failed to load certificate image"));
    } catch (err) {
      reject(err);
    }
  });
};
