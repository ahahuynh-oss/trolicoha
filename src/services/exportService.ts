import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

const saveAs = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportMistakesToDocx = async (mistakes: Array<{ question: string; chosen: string; correct: string; topic: string }>, studentName = "Học sinh") => {
  if (!mistakes || mistakes.length === 0) {
    alert("Không có lỗi sai nào để xuất báo cáo.");
    return;
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: `Phiếu Bài Tập Củng Cố - ${studentName}`,
            heading: HeadingLevel.HEADING_1,
            alignment: "center",
          }),
          new Paragraph({
            text: `Ngày tạo: ${new Date().toLocaleDateString("vi-VN")}`,
            alignment: "center",
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "Dưới đây là danh sách các câu hỏi bạn cần ôn tập lại. Hãy cố gắng làm lại và đối chiếu với đáp án đúng nhé!",
            spacing: { after: 300 },
          }),
          ...mistakes.flatMap((mistake, index) => [
            new Paragraph({
              children: [
                new TextRun({ text: `Câu ${index + 1} [Chuyên đề: ${mistake.topic}]: `, bold: true }),
                new TextRun(mistake.question),
              ],
              spacing: { before: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Đáp án bạn đã chọn: ", italics: true }),
                new TextRun({ text: mistake.chosen, strike: true, color: "999999" }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Đáp án đúng: ", bold: true, color: "2E7442" }),
                new TextRun({ text: mistake.correct, color: "2E7442" }),
              ],
              spacing: { after: 200 },
            }),
          ]),
          new Paragraph({
            text: "--- Chúc bạn học tập tốt! ---",
            alignment: "center",
            spacing: { before: 400 },
          }),
        ],
      },
    ],
  });

  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Phieu-Bai-Tap-${new Date().getTime()}.docx`);
  } catch (error) {
    console.error("Lỗi khi tạo file Docx:", error);
  }
};
