
function generateATRNo() {
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // Generate a random 5-digit number
    return `IT-ATR-${randomNumber}`;
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('atrNo').value = generateATRNo();
});

let currentSignatureTarget = null;

// Initialize the canvas for signature
const modal = document.getElementById("signatureModal");
const canvas = document.getElementById("signatureCanvas");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 5; // Set the line thickness (adjust this value as needed)
ctx.strokeStyle = "black"; // Set the line color
let drawing = false;

// Set canvas size to fill modal
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.5;



// Attach event listeners for both mouse and touch
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);

// For touch devices
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent scrolling
    startDrawing(getTouchPos(e));
});
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Prevent scrolling
    draw(getTouchPos(e));
});
canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopDrawing();
});

// Function to start drawing
function startDrawing(position) {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
}

// Function to draw
function draw(position) {
    if (!drawing) return;
    ctx.lineWidth = 7;
    ctx.lineTo(position.x, position.y);
    ctx.stroke();
}

// Function to stop drawing
function stopDrawing() {
    drawing = false;
}

// Helper function to get touch position
function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

// Show modal for signature
document.getElementById("studentSignatureBtn").addEventListener("click", () => {
    currentSignatureTarget = "studentSignature";
    modal.style.display = "block";
});

document.getElementById("additionalSignatureBtn").addEventListener("click", () => {
    currentSignatureTarget = "additionalSignature";
    modal.style.display = "block";
});

// Save the signature
document.getElementById("saveSignature").addEventListener("click", () => {
    const dataURL = canvas.toDataURL("image/png");
    document.getElementById(currentSignatureTarget).value = dataURL;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    modal.style.display = "none";
});

// Cancel the signature
document.getElementById("cancelSignature").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    modal.style.display = "none";
});

async function sendEmailWithPDF(pdfBytes) {
    const formData = new FormData();
    formData.append('file', new Blob([pdfBytes], { type: "application/pdf" }), 'GrievanceForm.pdf');

    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            alert('PDF sent successfully!');
        } else {
            alert('Failed to send the PDF.');
        }
    } catch (error) {
        console.error("Error sending email:", error);
        alert("Error sending email.");
    }
}





async function fillPDF() {
    try {
        const date = formatDate(document.getElementById('date').value);
        const atrNo = document.getElementById('atrNo').value;
        const studentName = document.getElementById('studentName').value;
        const regNumber = document.getElementById('regNumber').value;
        const Department = document.getElementById('Department').value;
        const HostelBlock = document.getElementById('HostelBlock').value;
        const RoomNo = document.getElementById('RoomNo').value;
        const grievance = document.getElementById('grievance').value;
        const feedback = document.getElementById("feedback").value;
        const studentSignature = document.getElementById("studentSignature").value;
        const additionalSignature = document.getElementById("additionalSignature").value;
        
        const dateGrievance = formatDate(document.getElementById('dateGrievance').value);
        const dateResolution = formatDate(document.getElementById('dateResolution').value);
        const GrievanceResolvedby = document.getElementById('GrievanceResolvedby').value;
        

        const response = await fetch("atr.pdf");
        const existingPdfBytes = await response.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const pageHeight = firstPage.getHeight();  // Get the page height
        const yPosition = (y) => pageHeight - y;  // Inverted Y to make the text go down the page


        firstPage.drawText(`${date}`, { x: 454, y: yPosition(172), size: 12 });
        firstPage.drawText(`${atrNo}`, { x: 128, y: yPosition(173), size: 12 });
        firstPage.drawText(`${studentName}`, { x: 280, y: yPosition(291), size: 12 });
        firstPage.drawText(`${regNumber}`, { x: 280, y: yPosition(318), size: 12 });
        firstPage.drawText(`${Department}`, { x: 280, y: yPosition(338), size: 12 });
        firstPage.drawText(`${HostelBlock}`, { x: 280, y: yPosition(365), size: 12 });
        firstPage.drawText(`${RoomNo}`, { x: 280, y: yPosition(389), size: 12 });
        firstPage.drawText(`${GrievanceResolvedby}`, { x: 280, y: yPosition(537), size: 12 });
        firstPage.drawText(`${grievance}`, { x: 280, y: yPosition(444), size: 12 });
        firstPage.drawText(`${dateGrievance}`, { x: 280, y: yPosition(472), size: 12 });
        firstPage.drawText(`${dateResolution}`, { x: 280, y: yPosition(503), size: 12 });

        // Add tick mark based on feedback
        let tickX, tickY;
        if (feedback === "Good") {
            tickX = 160;
            tickY = firstPage.getHeight() - 576;
        } else if (feedback === "Satisfactory") {
            tickX = 358;
            tickY = firstPage.getHeight() - 576;
        } else if (feedback === "Poor") {
            tickX = 504;
            tickY = firstPage.getHeight() - 576;
        }
        if (tickX && tickY) {
            firstPage.drawSvgPath('M 0 10 L 5 15 L 15 0 L 14 -1 L 5 14 L -1 9 Z', {
                x: tickX,
                y: tickY,
                color: PDFLib.rgb(0, 0, 0.7),
                borderWidth: 3,
            });
        }

        // Add signatures
        if (studentSignature) {
            const studentSignatureImage = await pdfDoc.embedPng(studentSignature);
            firstPage.drawImage(studentSignatureImage, {
                x: 89,
                y: firstPage.getHeight() - 654,
                width: 150,
                height: 50,
            });
        }

        if (additionalSignature) {
            const additionalSignatureImage = await pdfDoc.embedPng(additionalSignature);
            firstPage.drawImage(additionalSignatureImage, {
                x: 393,
                y: firstPage.getHeight() - 654,
                width: 150,
                height: 50,
            });
        }


 
        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        await sendEmailWithPDF(pdfBytes);
        
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "GrievanceForm.pdf";
        link.click();
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate the PDF.");
    }
}
