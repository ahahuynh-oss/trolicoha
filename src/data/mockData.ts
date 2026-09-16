import { AppData, GlossaryTerm, SocraticStep } from "../types";

export const SOCRATIC_STEPS: SocraticStep[] = [
  {
    stepNumber: 1,
    title: "Nhận diện đề bài",
    subtitle: "Giả thiết & Kết luận",
    description: "Đề bài cho điều kiện gì? Cần tìm hay chứng minh điều gì? Gạch chân các con số then chốt.",
    icon: "fa-magnifying-glass"
  },
  {
    stepNumber: 2,
    title: "Gợi nhớ kiến thức gốc",
    subtitle: "Định nghĩa & Công thức nền",
    description: "Bài toán này dùng đến định lý hoặc công thức lớp dưới nào? Có bị quên khái niệm gốc không?",
    icon: "fa-book-open-reader"
  },
  {
    stepNumber: 3,
    title: "Định hướng bước đầu",
    subtitle: "Tìm manh mối xuất phát",
    description: "Nên biến đổi vế nào trước? Có thể vẽ hình phác thảo hoặc đặt ẩn phụ không?",
    icon: "fa-compass"
  },
  {
    stepNumber: 4,
    title: "Tự tay làm thử",
    subtitle: "Kiểm tra sự hiểu biết",
    description: "Thử viết 1-2 dòng biến đổi đầu tiên theo gợi ý. Đừng sợ sai, sai ở đâu ta sửa ở đó!",
    icon: "fa-pencil"
  },
  {
    stepNumber: 5,
    title: "Tháo gỡ nút thắt",
    subtitle: "Vượt qua chỗ tắc nghẽn",
    description: "Chỉ ra bẫy điều kiện (mẫu số khác 0, biểu thức trong căn $\\ge 0$) hoặc lỗi tính toán thường gặp.",
    icon: "fa-wand-magic-sparkles"
  },
  {
    stepNumber: 6,
    title: "Hoàn tất kết quả",
    subtitle: "Tự mình đi tới đích",
    description: "Học sinh tự ra đáp số cuối cùng và đối chiếu lại với điều kiện ban đầu của bài toán.",
    icon: "fa-circle-check"
  },
  {
    stepNumber: 7,
    title: "Đúc kết & Mở rộng",
    subtitle: "Bản chất & Bài tương tự",
    description: "Tổng kết lại bí kíp giải dạng bài này bằng 1 câu ngắn gọn và thử sức bài tương tự để nhớ lâu.",
    icon: "fa-award"
  }
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: "term-1",
    term: "Đạo hàm (Derivative)",
    grade: 11,
    standardDef: "Đạo hàm của hàm số $y = f(x)$ tại điểm $x_0$ là giới hạn (nếu có) của tỉ số giữa số gia của hàm số và số gia của đối số khi số gia của đối số tiến dần về 0: $f'(x_0) = \\lim_{\\Delta x \\to 0} \\frac{\\Delta y}{\\Delta x}$.",
    simpleDef: "Đạo hàm chính là thước đo xem một thứ đang thay đổi 'nhanh hay chậm' ngay tại một thời điểm tức thời.",
    analogy: "Giống như lúc bạn phóng xe máy lên dốc đèo, kim đồng hồ tốc độ chỉ 40 km/h ngay lúc đó; hoặc xem mực nước suối dâng nhanh hay chậm sau cơn mưa rừng.",
    relatedFormula: "f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x) - f(x)}{\\Delta x}"
  },
  {
    id: "term-2",
    term: "Hàm số đồng biến & nghịch biến",
    grade: 10,
    standardDef: "Hàm số $y = f(x)$ đồng biến trên khoảng $(a; b)$ nếu với mọi $x_1 < x_2$ thì $f(x_1) < f(x_2)$. Nghịch biến nếu $x_1 < x_2$ thì $f(x_1) > f(x_2)$.",
    simpleDef: "Đồng biến là 'cùng tiến': x tăng thì y cũng tăng theo. Nghịch biến là 'ngược nhau': x tăng thì y lại tụt xuống.",
    analogy: "Đồng biến như leo dốc ruộng bậc thang (càng đi xa càng lên cao). Nghịch biến như đổ dốc xuống thung lũng (càng đi xa độ cao càng giảm dần).",
    relatedFormula: "x_1 < x_2 \\implies f(x_1) < f(x_2) \\text{ (Đồng biến)}"
  },
  {
    id: "term-3",
    term: "Vectơ trong không gian (Vector)",
    grade: 10,
    standardDef: "Vectơ là một đoạn thẳng có hướng, có điểm đầu và điểm cuối xác định. Vectơ đặc trưng bởi phương, chiều và độ dài.",
    simpleDef: "Vectơ là một mũi tên chỉ đường: nó vừa cho biết đi về hướng nào, vừa cho biết đi xa bao nhiêu mét.",
    analogy: "Như khi người làng chỉ đường đi nương: 'Đi thẳng theo dòng suối về phía mặt trời mọc (hướng), chừng 3 quả đồi (độ dài)'.",
    relatedFormula: "\\vec{a} = (x; y; z), \\quad |\\vec{a}| = \\sqrt{x^2 + y^2 + z^2}"
  },
  {
    id: "term-4",
    term: "Nguyên hàm & Tích phân (Integral)",
    grade: 12,
    standardDef: "Hàm số $F(x)$ gọi là nguyên hàm của $f(x)$ nếu $F'(x) = f(x)$. Tích phân xác định $\\int_a^b f(x)dx$ thể hiện diện tích hình thang cong giới hạn bởi đồ thị hàm số.",
    simpleDef: "Nếu Đạo hàm là băm nhỏ ra để xem tốc độ, thì Tích phân là 'gom góp, cộng dồn' vô số mảnh cực nhỏ lại thành một khối lớn.",
    analogy: "Như việc đong từng gùi thóc đổ vào bồ lớn để tính xem cả vụ mùa thu hoạch được bao nhiêu tạ thóc; hay tính diện tích cả mảnh nương cong queo bên bờ suối.",
    relatedFormula: "\\int_a^b f(x) dx = F(b) - F(a)"
  },
  {
    id: "term-5",
    term: "Mặt phẳng & Góc nhị diện",
    grade: 11,
    standardDef: "Góc nhị diện là hình tạo bởi hai nửa mặt phẳng có chung một bờ. Số đo góc nhị diện là số đo góc phẳng tạo bởi hai tia vuông góc với bờ tại cùng một điểm.",
    simpleDef: "Góc nhị diện giống như độ mở rộng hay hẹp của hai mái nhà hoặc hai trang sách khi mở ra.",
    analogy: "Hãy nhìn hai mái dốc của ngôi nhà sàn gặp nhau ở nóc nhà: góc mở giữa hai mái che mưa đó chính là góc nhị diện!",
    relatedFormula: "\\cos(\\alpha) = \\frac{|\\vec{n}_1 \\cdot \\vec{n}_2|}{|\\vec{n}_1| |\\vec{n}_2|}"
  },
  {
    id: "term-6",
    term: "Xác suất có điều kiện (Conditional Probability)",
    grade: 12,
    standardDef: "Xác suất của biến cố A khi biết biến cố B đã xảy ra ký hiệu là $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$ với $P(B) > 0$.",
    simpleDef: "Tính cơ hội xảy ra một việc khi ta đã biết trước một dấu hiệu nào đó chắc chắn đã xảy ra.",
    analogy: "Nhìn trời sáng thấy mây đen mù mịt từ hướng núi kéo về (biến cố B), thì cơ hội trời đổ mưa to trong chiều nay (biến cố A) sẽ tăng vọt so với ngày nắng ráo bình thường.",
    relatedFormula: "P(A|B) = \\frac{P(AB)}{P(B)}"
  }
];

export const INITIAL_APP_DATA: AppData = {
  subjects: [
    {
      id: "sub-10-1",
      grade: 10,
      name: "Mệnh đề & Tập hợp",
      icon: "fa-shapes",
      category: "Đại số & Giải tích",
      description: "Khái niệm mệnh đề, phủ định, tập hợp, các phép toán giao, hợp, hiệu.",
      questionsCount: 12,
      completedCount: 8
    },
    {
      id: "sub-10-2",
      grade: 10,
      name: "Bất phương trình bậc nhất hai ẩn",
      icon: "fa-chart-area",
      category: "Đại số & Giải tích",
      description: "Biểu diễn miền nghiệm trên mặt phẳng tọa độ, bài toán tối ưu thực tế.",
      questionsCount: 10,
      completedCount: 5
    },
    {
      id: "sub-10-3",
      grade: 10,
      name: "Hàm số bậc hai & Đồ thị",
      icon: "fa-bezier-curve",
      category: "Đại số & Giải tích",
      description: "Đỉnh Parabol, bảng biến thiên, tìm khoảng đồng biến nghịch biến.",
      questionsCount: 15,
      completedCount: 9
    },
    {
      id: "sub-10-4",
      grade: 10,
      name: "Hệ thức lượng trong tam giác",
      icon: "fa-draw-polygon",
      category: "Hình học & Đo lường",
      description: "Định lý Côsin, định lý Sin, diện tích tam giác, ứng dụng đo đạc đồi núi.",
      questionsCount: 14,
      completedCount: 6
    },
    {
      id: "sub-11-1",
      grade: 11,
      name: "Hàm số lượng giác & Phương trình",
      icon: "fa-wave-square",
      category: "Đại số & Giải tích",
      description: "Vòng tròn lượng giác, công thức nghiệm $\\sin x = m, \\cos x = m$.",
      questionsCount: 18,
      completedCount: 7
    },
    {
      id: "sub-11-2",
      grade: 11,
      name: "Dãy số, Cấp số cộng & Cấp số nhân",
      icon: "fa-arrow-up-right-dots",
      category: "Đại số & Giải tích",
      description: "Công sai, công bội, số hạng tổng quát $u_n$ và tổng $S_n$.",
      questionsCount: 12,
      completedCount: 4
    },
    {
      id: "sub-11-3",
      grade: 11,
      name: "Đạo hàm & Ý nghĩa thực tiễn",
      icon: "fa-calculator",
      category: "Đại số & Giải tích",
      description: "Quy tắc tính đạo hàm hàm hợp, tiếp tuyến và vận tốc tức thời.",
      questionsCount: 20,
      completedCount: 11
    },
    {
      id: "sub-11-4",
      grade: 11,
      name: "Quan hệ vuông góc trong không gian",
      icon: "fa-cube",
      category: "Hình học & Đo lường",
      description: "Đường thẳng vuông góc mặt phẳng, góc giữa hai mặt phẳng, khoảng cách.",
      questionsCount: 16,
      completedCount: 5
    },
    {
      id: "sub-12-1",
      grade: 12,
      name: "Khảo sát & Vẽ đồ thị hàm số",
      icon: "fa-chart-line",
      category: "Đại số & Giải tích",
      description: "Cực trị, tiệm cận đứng, tiệm cận ngang, giá trị lớn nhất nhỏ nhất.",
      questionsCount: 25,
      completedCount: 14
    },
    {
      id: "sub-12-2",
      grade: 12,
      name: "Nguyên hàm & Tích phân",
      icon: "fa-infinity",
      category: "Đại số & Giải tích",
      description: "Bảng nguyên hàm cơ bản, đổi biến số, từng phần, diện tích hình phẳng.",
      questionsCount: 22,
      completedCount: 8
    },
    {
      id: "sub-12-3",
      grade: 12,
      name: "Tọa độ Vectơ & Không gian Oxyz",
      icon: "fa-arrows-split-up-and-left",
      category: "Hình học & Đo lường",
      description: "Tọa độ điểm, vectơ, phương trình mặt phẳng và mặt cầu.",
      questionsCount: 20,
      completedCount: 12
    },
    {
      id: "sub-12-4",
      grade: 12,
      name: "Xác suất có điều kiện & Bayes",
      icon: "fa-dice",
      category: "Thống kê & Xác suất",
      description: "Xác suất toàn phần, công thức Bayes, phân tích rủi ro thực tế.",
      questionsCount: 14,
      completedCount: 3
    }
  ],
  questions: [
    {
      id: "q-1",
      subjectId: "sub-12-1",
      grade: 12,
      content: "Tìm tiệm cận ngang của đồ thị hàm số $y = \\frac{2x - 3}{x + 1}$.",
      type: "multiple_choice",
      options: [
        "Đường thẳng $y = 2$",
        "Đường thẳng $x = -1$",
        "Đường thẳng $y = -3$",
        "Đường thẳng $x = 2$"
      ],
      correctAnswer: 0,
      explanation: "Tiệm cận ngang được tìm bằng giới hạn khi $x \\to \\pm\\infty$: $\\lim_{x \\to \\infty} \\frac{2x - 3}{x + 1} = \\lim_{x \\to \\infty} \\frac{2 - 3/x}{1 + 1/x} = 2$. Do đó đồ thị có tiệm cận ngang là $y = 2$.",
      difficulty: "Nhận biết",
      prerequisiteHint: "Hổng kiến thức Giới hạn dãy số và hàm số ở Lớp 11 (kỹ thuật chia cả tử và mẫu cho bậc cao nhất của x).",
      realLifeAnalogy: "Giống như con suối càng chảy ra xa hạ lưu thì độ cao mặt nước càng tiệm cận dần về mực nước biển ngang bằng 2m."
    },
    {
      id: "q-2",
      subjectId: "sub-12-1",
      grade: 12,
      content: "Cho hàm số $y = x^3 - 3x^2 + 2$. Điểm cực tiểu của đồ thị hàm số là điểm nào sau đây?",
      type: "multiple_choice",
      options: [
        "$(0; 2)$",
        "$(2; -2)$",
        "$x = 2$",
        "$(2; 0)$"
      ],
      correctAnswer: 1,
      explanation: "Ta có đạo hàm $y' = 3x^2 - 6x = 3x(x - 2)$. Cho $y' = 0 \\iff x = 0$ hoặc $x = 2$. Bảng biến thiên cho thấy qua $x = 2$ đạo hàm đổi dấu từ âm sang dương nên $x = 2$ là điểm cực tiểu. Thay vào hàm ban đầu: $y(2) = 2^3 - 3(2^2) + 2 = 8 - 12 + 2 = -2$. Vậy điểm cực tiểu của đồ thị là $(2; -2)$.",
      difficulty: "Thông hiểu",
      prerequisiteHint: "Hổng kiến thức Lập bảng xét dấu nhị thức bậc nhất / tam thức bậc hai ở Lớp 10.",
      realLifeAnalogy: "Cực tiểu giống như đáy của thung lũng giữa 2 ngọn đồi: bạn đi từ sườn đồi dốc xuống (đạo hàm âm), chạm đáy bằng phẳng rồi lại leo dốc lên (đạo hàm dương)."
    },
    {
      id: "q-3",
      subjectId: "sub-11-3",
      grade: 11,
      content: "Tính đạo hàm của hàm số $y = \\sqrt{2x + 1}$ với $x > -\\frac{1}{2}$.",
      type: "multiple_choice",
      options: [
        "$y' = \\frac{1}{2\\sqrt{2x+1}}$",
        "$y' = \\frac{1}{\\sqrt{2x+1}}$",
        "$y' = \\frac{2}{\\sqrt{2x+1}}$",
        "$y' = \\sqrt{2}$"
      ],
      correctAnswer: 1,
      explanation: "Sử dụng quy tắc đạo hàm hàm hợp $(\\sqrt{u})' = \\frac{u'}{2\\sqrt{u}}$. Ở đây $u = 2x + 1 \\implies u' = 2$. Do đó $y' = \\frac{2}{2\\sqrt{2x+1}} = \\frac{1}{\\sqrt{2x+1}}$.",
      difficulty: "Thông hiểu",
      prerequisiteHint: "Dễ nhầm lẫn quên nhân thêm đạo hàm hàm hợp $u'$ (kiến thức lớp 11).",
      realLifeAnalogy: "Như bóc bánh chưng: muốn biết bên trong cần bóc lớp lá ngoài $(\\sqrt{u})$ rồi mới đến lớp nhân $(u')$."
    },
    {
      id: "q-4",
      subjectId: "sub-10-3",
      grade: 10,
      content: "Tọa độ đỉnh $I$ của Parabol $(P): y = x^2 - 4x + 3$ là:",
      type: "multiple_choice",
      options: [
        "$I(2; -1)$",
        "$I(-2; 15)$",
        "$I(4; 3)$",
        "$I(2; 1)$"
      ],
      correctAnswer: 0,
      explanation: "Công thức tọa độ đỉnh Parabol $y = ax^2 + bx + c$ là $x_I = -\\frac{b}{2a} = -\\frac{-4}{2(1)} = 2$. Thay $x = 2$ vào $(P)$: $y_I = 2^2 - 4(2) + 3 = 4 - 8 + 3 = -1$. Vậy đỉnh $I(2; -1)$.",
      difficulty: "Nhận biết",
      prerequisiteHint: "Hổng kỹ năng hằng đẳng thức $(a-b)^2 = a^2 - 2ab + b^2$ từ Lớp 8: $x^2 - 4x + 3 = (x-2)^2 - 1$.",
      realLifeAnalogy: "Đỉnh Parabol là điểm thấp nhất của chiếc máng dẫn nước bằng tre khi đặt cong."
    },
    {
      id: "q-5",
      subjectId: "sub-12-3",
      grade: 12,
      content: "Trong không gian $Oxyz$, cho hai điểm $A(1; 2; -1)$ và $B(3; 0; 1)$. Tọa độ trung điểm $M$ của đoạn thẳng $AB$ là:",
      type: "multiple_choice",
      options: [
        "$M(2; 1; 0)$",
        "$M(4; 2; 0)$",
        "$M(1; -1; 1)$",
        "$M(2; 2; 0)$"
      ],
      correctAnswer: 0,
      explanation: "Tọa độ trung điểm là trung bình cộng tọa độ 2 đầu mút: $x_M = \\frac{1 + 3}{2} = 2$, $y_M = \\frac{2 + 0}{2} = 1$, $z_M = \\frac{-1 + 1}{2} = 0$. Vậy $M(2; 1; 0)$.",
      difficulty: "Nhận biết",
      prerequisiteHint: "Công thức trung bình cộng hai số học sinh hay nhầm lấy trừ thay vì cộng.",
      realLifeAnalogy: "Điểm chính giữa cây cầu treo nối hai bờ suối A và B."
    },
    {
      id: "q-6",
      subjectId: "sub-12-2",
      grade: 12,
      content: "Tính nguyên hàm $I = \\int (3x^2 - 2x + 1) dx$.",
      type: "multiple_choice",
      options: [
        "$x^3 - x^2 + x + C$",
        "$6x - 2 + C$",
        "$3x^3 - 2x^2 + x + C$",
        "$\\frac{x^3}{3} - \\frac{x^2}{2} + x + C$"
      ],
      correctAnswer: 0,
      explanation: "Áp dụng công thức cơ bản $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$: $\\int 3x^2 dx = 3 \\cdot \\frac{x^3}{3} = x^3$, $\\int (-2x) dx = -2 \\cdot \\frac{x^2}{2} = -x^2$, $\\int 1 dx = x$. Kết quả là $x^3 - x^2 + x + C$.",
      difficulty: "Thông hiểu",
      prerequisiteHint: "Nhiều bạn bị nhầm lẫn giữa công thức đạo hàm (hạ bậc) và công thức nguyên hàm (nâng bậc).",
      realLifeAnalogy: "Đạo hàm là cưa cây ra khúc nhỏ, nguyên hàm là tìm lại chiều cao ban đầu của cái cây trước khi cưa."
    }
  ],
  sessions: [
    {
      id: "ses-1",
      subjectId: "sub-12-1",
      subjectName: "Khảo sát & Vẽ đồ thị hàm số",
      score: 8.5,
      totalQuestions: 6,
      correctAnswers: 5,
      timeSpent: 720,
      date: "2026-09-15 20:30"
    },
    {
      id: "ses-2",
      subjectId: "sub-11-3",
      subjectName: "Đạo hàm & Ý nghĩa thực tiễn",
      score: 7.0,
      totalQuestions: 5,
      correctAnswers: 3,
      timeSpent: 650,
      date: "2026-09-14 19:45"
    }
  ],
  progress: {
    totalAttempts: 18,
    averageScore: 7.8,
    streakDays: 4,
    lastActiveDate: "2026-09-16",
    dailyGoalMinutes: 15,
    todayMinutesSpent: 11,
    weakTopics: [
      {
        topicId: "sub-11-3",
        topicName: "Đạo hàm hàm hợp & điều kiện xác định",
        missedCount: 4,
        rootCauseGrade: 10,
        advice: "Cần củng cố lại cách đặt điều kiện biểu thức dưới dấu căn $\\ge 0$ và quy tắc dây chuyền $(f(u))' = u' \\cdot f'(u)$."
      },
      {
        topicId: "sub-10-3",
        topicName: "Hằng đẳng thức & Phân tích thành nhân tử",
        missedCount: 3,
        rootCauseGrade: 8,
        advice: "Ôn lại 7 hằng đẳng thức đáng nhớ để biến đổi nhanh phương trình bậc 2 mà không phụ thuộc máy tính Casio."
      }
    ],
    badges: [
      "Khởi đầu kiên định",
      "Chiến binh 15 phút",
      "Vượt dốc thành công"
    ]
  },
  settings: {
    theme: "light",
    soundEnabled: true,
    speechVoiceRate: 1.0,
    autoSave: true,
    selectedModel: "gemini-2.5-flash",
    customApiKey: "",
    preferredDialect: "simple_ethnic",
    fontSize: "large",
    villageFriendlyMode: true,
    autoReadAloud: true
  },
  userProfile: {
    name: "Học sinh",
    gradeLevel: 12
  }
};
