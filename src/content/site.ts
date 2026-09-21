import type { Locale, T } from '@/lib/i18n';

/**
 * LIWAN — a fictional architecture studio in Riyadh.
 *
 * A liwan is the vaulted hall that opens onto a courtyard in Arabian building: shade on one
 * side, sun on the other, and a threshold between.
 *
 * Arabic is the first language of this site, and it is written, not translated: each pair
 * below says the same thing the way each language would say it. Keep them side by side so
 * neither drifts.
 */

const L = (ar: string, en: string): T => ({ ar, en });

export const studio = {
  name: 'LIWAN',
  nameAr: 'ليوان',
  email: 'studio@liwan.com',
  phone: '+966 11 000 0000',
  founded: 2009,
};

const source = {
  meta: {
    title: L('ليوان — عمارة سكنية تبدأ من طريقة عيشك', 'LIWAN — Architecture designed for living'),
    description: L(
      'ليوان استوديو معماري في الرياض يصمّم الفلل والمساكن الخاصة. تجوّل في المسكن بالأبعاد الثلاثة، واختر موادّه، وشاهد النتيجة قبل أن يُبنى جدار واحد.',
      'LIWAN is a Riyadh studio designing private villas and residences. Walk the house in 3D, choose its materials, and see the result before a single wall is built.',
    ),
  },

  studio: {
    line: L('عمارة سكنية تبدأ من طريقة عيشك.', 'Architecture designed for living.'),
    city: L('الرياض', 'Riyadh'),
    address: L('حي السفارات، الرياض، المملكة العربية السعودية', 'Diplomatic Quarter, Riyadh, Saudi Arabia'),
    founded: L('تأسّس عام 2009', 'Founded 2009'),
  },

  nav: {
    items: [
      { label: L('المشاريع', 'Projects'), href: '#projects' },
      { label: L('صمّم مسكنك', 'Residence'), href: '#residence' },
      { label: L('منهجنا', 'Approach'), href: '#experience' },
      { label: L('المواد', 'Materials'), href: '#materials' },
      { label: L('الاستوديو', 'Studio'), href: '#studio' },
      { label: L('تواصل', 'Contact'), href: '#contact' },
    ],
    cta: L('ابدأ مشروعك', 'Start a project'),
    open: L('فتح القائمة', 'Open menu'),
    close: L('إغلاق القائمة', 'Close menu'),
    primary: L('التنقّل الرئيسي', 'Primary'),
    /** The switcher names the language you would switch TO, in that language. */
    switchTo: L('English', 'العربية'),
    switchLabel: L('Switch to English', 'التبديل إلى العربية'),
  },

  hero: {
    aria: L('المسكن في جولة مصوّرة', 'The residence, in film'),
    kicker: L('ليوان · عمارة سكنية', 'Liwan · Residential architecture'),
    line1: L('عمارة سكنية', 'Architecture'),
    line2: L('تبدأ من طريقة عيشك.', 'designed for living.'),
    text: L(
      'نصمّم الفلل والمساكن الخاصة في المملكة، ونبنيها أولًا نموذجًا ثلاثي الأبعاد تتجوّل فيه وتختار موادّه بنفسك، قبل أن يُصبّ أول أساس.',
      'We design private villas and residences across the Kingdom, and build each one first as a model you can walk through and specify, before a single foundation is poured.',
    ),
    primary: L('تجوّل في المسكن', 'Explore the residence'),
    secondary: L('شاهد المشاريع', 'View projects'),
    scroll: L('مرّر للدخول', 'Scroll to enter'),
    chapters: [
      { at: 0.06, label: L('المسكن', 'The residence'), note: L('دور أرضي بعرض 24 مترًا وعمق 14، ينفتح جنوبًا على المسبح', 'A ground floor 24 metres by 14, opening south onto the pool') },
      { at: 0.3, label: L('العتبة', 'The threshold'), note: L('زجاج بكامل الارتفاع، وسقف يتقدّمه بمتر ونصف ليظلّله', 'Full-height glass, shaded by a roof that oversails it by a metre and a half') },
      { at: 0.52, label: L('المعيشة', 'Living'), note: L('فراغ واحد: ضوء شمالي هادئ من الفتحات العلوية، وانفتاح جنوبي على الفناء', 'One room: quiet north light through the high slots, open south to the terrace') },
      { at: 0.7, label: L('المطبخ', 'Kitchen'), note: L('جزيرة من الحجر وخزائن من الخشب، وكلاهما من اختيارك', 'An island in stone and cabinetry in timber, both specified by you') },
      { at: 0.86, label: L('الفناء والمسبح', 'The terrace'), note: L('مسبح بطول اثني عشر مترًا، موجَّه نحو شمس العصر', 'A twelve-metre pool, laid along the evening sun') },
    ],
  },

  statement: {
    label: L('الفكرة', 'The idea'),
    lead: L('لا نصمّم بيوتًا فحسب؛ نصمّم كيف يمرّ اليوم داخل البيت.', 'We do not design houses. We design how a day moves through a house.'),
    body: [
      L(
        'المخطّط في حقيقته جدولٌ للضوء: أين تقع الشمس في السابعة صباحًا، وأين يستقرّ الظل في الثالثة عصرًا، وأيّ جدار تلمسه يدك عند الدخول، وأيّ غرفة لا تودّ مغادرتها في المساء.',
        'A plan is a schedule of light. Where the sun lands at seven, where the shade sits at three, which wall you touch on the way in, and which room you never want to leave in the evening.',
      ),
      L(
        'ولأن البيت هنا حَرَمٌ لأهله، نغلقه على الشارع ونفتحه على الفناء. الحجر والنجارة وعمق الفتحات تأتي بعد ذلك لتخدم هذا الترتيب؛ ولهذا تبدأ رسوماتنا بالشمس والرياح والخصوصية، لا بالواجهة.',
        'And because a home here is private ground, we close it to the street and open it to the courtyard. The stone, the joinery, the depth of a reveal all follow from that order. It is why our drawings begin with sun, wind and privacy, not with the elevation.',
      ),
    ],
  },

  experience: {
    label: L('لماذا نبنيه بالأبعاد الثلاثة أولًا', 'Why we build it in 3D first'),
    title: L('شاهده قبل أن يُبنى.', 'See it before it exists.'),
    text: L('الصورة المعمارية لقطةٌ لقرار واحد. أما النموذج فهو كل القرارات، وما زالت مفتوحة.', 'A render is a photograph of one decision. A model is every decision, still open.'),
    points: [
      {
        n: '01',
        title: L('تجوّل فيه، لا تتخيّله', 'Walk it, do not imagine it'),
        text: L('قف في غرفة المعيشة بارتفاع نظرك الحقيقي؛ عندها تتحوّل المسافات من أرقام على الورق إلى إحساس.', 'Stand in the living room at the height you actually stand. Distances stop being numbers on a drawing.'),
      },
      {
        n: '02',
        title: L('اختر في الضوء الحقيقي', 'Choose in the real light'),
        text: L('الرخام في علبة العيّنات ليس هو الرخام عند الرابعة عصرًا. هنا ترى كل مادة في ضوء البيت نفسه.', 'Marble in a sample box is not marble at four in the afternoon. Here every finish is seen in the light of the house itself.'),
      },
      {
        n: '03',
        title: L('قرار واحد، وتنفيذ واحد', 'Decide once, build once'),
        text: L('كل تعديل يُحسم على الشاشة هو تعديل لن يُجرى في الموقع، حيث يكلّف أسابيع بدل ثوانٍ.', 'Every change made on screen is a change not made on site, where it costs weeks instead of seconds.'),
      },
    ],
  },

  configure: {
    aria: L('صمّم مسكنك', 'Configure your residence'),
    label: L('التخصيص', 'Configure'),
    title: L('صمّم مسكنك.', 'Configure your residence.'),
    text: L(
      'قائمة قصيرة من القرارات التي تغيّر فعلًا إحساس البيت. اختر فراغًا فتنتقل الكاميرا إليه، ويتبدّل البيت أمامك مع كل اختيار.',
      'A short list of decisions, the ones that actually change how the house feels. Pick a room; the camera goes there and the house updates as you choose.',
    ),
    reset: L('العودة إلى مواصفات الاستوديو', 'Reset to the studio specification'),
    summary: L('مواصفاتك', 'Your specification'),
    cta: L('أرسل هذه المواصفات إلى الاستوديو', 'Send this specification to the studio'),
    ctaShort: L('أرسل المواصفات', 'Send specification'),
    note: L('لا شيء نهائي هنا؛ نكمل الحديث معك من حيث انتهيت.', 'Nothing is locked in. The studio takes it from here.'),
    open: L('اختر التشطيبات', 'Choose finishes'),
    close: L('إغلاق', 'Close'),
    hint: L('اسحب لتدير المشهد · مرّر للمتابعة', 'Drag to look around · scroll to continue'),
  },

  projectsSection: {
    label: L('مشاريع مختارة', 'Selected work'),
    title: L('أربعة مساكن، أربعة مواقع.', 'Four houses, four sites.'),
    intro: L('يبدأ كل مشروع مما تمنحه الأرض وما تمنعه، وما بعد ذلك نتيجةٌ له.', 'Each one begins with what the plot gives and what it refuses. The rest follows from that.'),
    view: L('عرض المشروع', 'View project'),
  },

  projectPage: {
    back: L('كل المشاريع', 'All projects'),
    facts: {
      name: L('اسم المشروع', 'Project'),
      location: L('الموقع', 'Location'),
      type: L('نوع المشروع', 'Type'),
      area: L('المساحة', 'Area'),
      year: L('سنة التنفيذ', 'Year'),
      scope: L('نطاق العمل', 'Scope of work'),
    },
    factsAria: L('بيانات المشروع', 'Project details'),
    concept: L('الفكرة', 'Concept'),
    exterior: L('من الخارج', 'Exterior'),
    interior: L('من الداخل', 'Interior'),
    materials: L('المواد', 'Materials'),
    drawings: L('الرسومات', 'Drawings'),
    specs: L('المواصفات الفنية', 'Technical specification'),
    drawingNote: L('مخطّط توضيحي · غير مخصّص للتنفيذ', 'Schematic drawing · not for construction'),
    modelNote: L('مرسوم من النموذج ثلاثي الأبعاد نفسه، لا معادٌ رسمه للصفحة.', 'Drawn from the 3D model itself, not redrawn for the page.'),
    modelImage: L('صورة من النموذج ثلاثي الأبعاد', 'Image from the 3D model'),
    model: {
      label: L('التجربة ثلاثية الأبعاد', '3D experience'),
      title: L('تجوّل في هذا المسكن، واختر موادّه.', 'Walk this house and choose its materials.'),
      titleOther: L('كل مسكن نصمّمه يبدأ نموذجًا كهذا.', 'Every house we design begins as a model like this.'),
      text: L(
        'نبني لكل مسكن نموذجًا قبل أن نرسم مخططاته. افتح النموذج، وتنقّل بين الفراغات، وغيّر التشطيبات لتراها في ضوء البيت نفسه.',
        'Every residence we design is modelled before it is drawn. Open the model, move through the rooms, and change the finishes to see them in the light of the house itself.',
      ),
      cta: L('افتح النموذج', 'Open the residence'),
    },
    next: L('المشروع التالي', 'Next project'),
    contact: {
      label: L('ابدأ مشروعك', 'Start a project'),
      title: L('أرسل لنا رقم القطعة.', 'Send us the plot number.'),
    },
  },

  projects: [
    {
      slug: 'courtyard-house',
      number: '01',
      year: '2024',
      name: L('بيت الفناء', 'Courtyard House'),
      location: L('الدرعية، الرياض', 'Diriyah, Riyadh'),
      type: L('فيلا سكنية خاصة', 'Private villa'),
      area: L('820 م²', '820 m²'),
      status: L('مكتمل', 'Completed'),
      scope: L('التصميم المعماري · التصميم الداخلي · تنسيق الموقع · الإشراف على التنفيذ', 'Architecture · Interior design · Landscape · Site supervision'),
      summary: L('بيتٌ منخفض بلون الأرض، تلتفّ أجنحته حول فناء يمنح العائلة سماءها الخاصة.', 'A low, earth-coloured house whose wings wrap a courtyard: a private piece of sky for the family.'),
      concept: L(
        'تقع الأرض على طرف الدرعية، بين جيرانٍ من ثلاث جهات وشارعٍ من الرابعة. لم يكن في الخارج ما يستحق الإطلالة، فصنع البيت إطلالته بنفسه: أربعة أجنحة تحيط بفناء، وجدران سميكة بفتحات غائرة، وسقف يتقدّم مترين ونصفًا ليظلّل الممرات. تستعير الغرف ضوءها من الفناء منعكسًا عن اللياسة، فلا تدخلها شمس الظهيرة مباشرة.',
        'The plot sits on the edge of Diriyah, with neighbours on three sides and a street on the fourth. There was nothing outside worth looking at, so the house makes its own view: four wings around a courtyard, thick walls with deep-set openings, and a roof that reaches two and a half metres over the walkways. Rooms borrow their light from the courtyard, bounced off render, so the midday sun never enters directly.',
      ),
      exterior: L(
        'لياسة معدنية بلون التربة المحلية، تُفرد يدويًا فتبقى عليها آثار المالج، وتتقادم مع السنين بدل أن تتّسخ.',
        'A mineral render in the colour of the local soil, hand-trowelled so the tool marks remain, and made to age rather than stain.',
      ),
      interior: L(
        'فتحات غائرة، وجبس بلون الأرض في الخارج، ودرج واحد من البلوط يدور مرة واحدة ليصل إلى جلسة السطح.',
        'Deep reveals, plaster the colour of the ground outside, and a single oak stair that turns once to reach the roof terrace.',
      ),
      plan: L(
        'أربعة أجنحة وفناء واحد. للمجلس مدخل مستقل من جهة الشارع، وجناح العائلة في عمق البيت بعيدًا عنه.',
        'Four wings and one courtyard. The majlis has its own entrance from the street; the family wing sits deep in the plan, away from it.',
      ),
      materials: [
        { name: L('لياسة معدنية', 'Mineral render'), note: L('تُفرد يدويًا بلون التربة المحلية', 'Hand-trowelled, in the colour of the local soil') },
        { name: L('حجر الرياض', 'Riyadh limestone'), note: L('للأرضيات الخارجية وحواف الفناء', 'External paving and the courtyard edge') },
        { name: L('بلوط', 'Oak'), note: L('الأبواب والدرج والنجارة الثابتة', 'Doors, the stair and fixed joinery') },
        { name: L('برونز', 'Bronze'), note: L('المقابض والتفاصيل، يُترك ليتعتّق', 'Handles and fittings, left to patinate') },
      ],
      specs: [
        { label: L('مساحة الأرض', 'Plot'), value: L('1,400 م²', '1,400 m²') },
        { label: L('مسطّح البناء', 'Built area'), value: L('820 م²', '820 m²') },
        { label: L('الأدوار', 'Storeys'), value: L('دوران', 'Two') },
        { label: L('غرف النوم', 'Bedrooms'), value: L('5', '5') },
        { label: L('النظام الإنشائي', 'Structure'), value: L('هيكل خرساني وجدران معزولة بسماكة 40 سم', 'Concrete frame, insulated walls 40 cm thick') },
        { label: L('التظليل', 'Shading'), value: L('بروز سقف 2.5 م وفتحات غائرة 60 سم', '2.5 m roof overhang, openings set back 60 cm') },
      ],
      drawing: 'courtyard',
    },
    {
      slug: 'atrium-villa',
      number: '02',
      year: '2025',
      name: L('فيلا البهو', 'Atrium Villa'),
      location: L('حي الشاطئ، جدة', 'Ash Shati, Jeddah'),
      type: L('فيلا سكنية خاصة', 'Private villa'),
      area: L('640 م²', '640 m²'),
      status: L('مكتمل', 'Completed'),
      scope: L('التصميم المعماري · التصميم الداخلي · الإشراف على التنفيذ', 'Architecture · Interior design · Site supervision'),
      summary: L('أرض ضيقة بين جارين، حُلّت بسحب البيت كله حول عمود واحد من الضوء.', 'A narrow plot between two neighbours, solved by pulling the whole house around a single shaft of light.'),
      concept: L(
        'عرض الأرض اثنا عشر مترًا وعمقها أربعون، والجيران على الجانبين. الضوء الوحيد الجدير بالبيت كان من الأعلى، ففُتح البيت من وسطه وسُقف بالزجاج. صارت الغرف كلها تطلّ إلى الداخل، على ضوء يتبدّل طوال النهار، دون نافذة واحدة تكشف البيت لجيرانه.',
        'Twelve metres wide and forty deep, with neighbours on both sides. The only light worth having came from above, so the house was opened down the middle and glazed at the top. Every room now faces inward, onto light that changes all day, and not one window gives the house away to its neighbours.',
      ),
      exterior: L('خرسانة مصبوبة على ألواح خشبية منشورة، فيحمل الجدار عروق الخشب الذي شكّله.', 'Concrete cast against sawn boards, so the wall carries the grain of the timber that shaped it.'),
      interior: L('درج من الرخام يصعد عبر البهو؛ عند الظهيرة هو ألمع ما في البيت، وعند الغروب أهدؤه.', 'A marble stair rises through the atrium; at noon it is the brightest object in the house, and at dusk the quietest.'),
      plan: L('المعيشة والمطبخ في الدور الأرضي، وأربع غرف نوم في الأعلى، وكلّها تطلّ على البهو.', 'Living and kitchen at grade, four bedrooms above, all of them facing the void.'),
      materials: [
        { name: L('خرسانة ظاهرة', 'Board-marked concrete'), note: L('تُصبّ في الموقع على ألواح منشورة', 'Cast in place against sawn boards') },
        { name: L('رخام أبيض', 'White marble'), note: L('للدرج وأرضية البهو', 'The stair and the atrium floor') },
        { name: L('جوز', 'Walnut'), note: L('للنجارة الداخلية والأبواب', 'Internal joinery and doors') },
        { name: L('فولاذ مصقول', 'Brushed steel'), note: L('للدرابزين وإطارات السقف الزجاجي', 'Balustrades and the rooflight frames') },
      ],
      specs: [
        { label: L('مساحة الأرض', 'Plot'), value: L('480 م²', '480 m²') },
        { label: L('مسطّح البناء', 'Built area'), value: L('640 م²', '640 m²') },
        { label: L('الأدوار', 'Storeys'), value: L('دوران وملحق علوي', 'Two, with a roof annexe') },
        { label: L('غرف النوم', 'Bedrooms'), value: L('4', '4') },
        { label: L('النظام الإنشائي', 'Structure'), value: L('جدران خرسانية ظاهرة مصبوبة في الموقع', 'Exposed in-situ concrete walls') },
        { label: L('التزجيج', 'Glazing'), value: L('سقف زجاجي مزدوج منخفض الانبعاثية فوق البهو', 'Double-glazed low-E rooflight over the atrium') },
      ],
      drawing: 'atrium',
    },
    {
      slug: 'olive-terraces',
      number: '03',
      year: '2022',
      name: L('مدرّجات الزيتون', 'Olive Terraces'),
      location: L('الهدا، الطائف', 'Al Hada, Taif'),
      type: L('مصيف عائلي خاص', 'Private summer residence'),
      area: L('1,150 م²', '1,150 m²'),
      status: L('مكتمل', 'Completed'),
      scope: L('التصميم المعماري · التصميم الداخلي · تنسيق الموقع', 'Architecture · Interior design · Landscape'),
      summary: L('مدرّجات زراعية قديمة بقيت كما وُجدت، وثلاثة أجنحة وُضعت بين أشجارها.', 'An old agricultural terrace kept exactly as found, with three pavilions set between its trees.'),
      concept: L(
        'كان شرط المالك واحدًا: ألّا تُقطع شجرة. فقُسم البيت إلى ثلاثة أجنحة، وسارت جدرانه على خطوط الجدران الحجرية الجافة القائمة أصلًا بين أشجار الزيتون البرّي. ما يبدو قرارًا تصميميًا كان في حقيقته رفعًا مساحيًا دقيقًا.',
        'The client had one condition: lose no tree. So the house was broken into three, and its walls follow the dry-stone retaining lines that already ran between the wild olives. What looks like a design decision was a careful survey.',
      ),
      exterior: L('حجر جيري جديد يجلس مباشرة فوق الحجر الجاف القديم، فيُقرأ المدماك الجديد امتدادًا للذي تحته.', 'New limestone sits directly on the old dry-stone, one course reading into the next.'),
      interior: L('أسقف منخفضة في جناح النوم، وسقف بارتفاع خمسة أمتار في جناح المعيشة، وممشى مسقوف يصل بينهما.', 'Low ceilings in the sleeping pavilion, a five-metre ceiling in the living one, and a covered walk between them.'),
      plan: L('ثلاثة أجنحة ومدرّجان، ومسبح طويل محفور على خط الكنتور.', 'Three pavilions, two terraces, and one long pool cut along the contour.'),
      materials: [
        { name: L('حجر جاف', 'Dry-stone'), note: L('الجدران الاستنادية القائمة، رُمّمت ولم تُستبدل', 'The existing retaining walls, repaired rather than replaced') },
        { name: L('حجر جيري', 'Limestone'), note: L('للجدران الجديدة وحواف المسبح', 'New walls and the pool coping') },
        { name: L('بلوط فاتح', 'Light oak'), note: L('للأسقف الداخلية والنجارة', 'Internal ceilings and joinery') },
        { name: L('برونز معتّق', 'Patinated bronze'), note: L('للأبواب المنزلقة ومقابضها', 'Sliding doors and their pulls') },
      ],
      specs: [
        { label: L('مساحة الأرض', 'Plot'), value: L('4,200 م²', '4,200 m²') },
        { label: L('مسطّح البناء', 'Built area'), value: L('1,150 م²', '1,150 m²') },
        { label: L('الأدوار', 'Storeys'), value: L('دور واحد لكل جناح', 'One per pavilion') },
        { label: L('غرف النوم', 'Bedrooms'), value: L('6', '6') },
        { label: L('النظام الإنشائي', 'Structure'), value: L('جدران حجرية حاملة وأسقف خرسانية', 'Load-bearing stone walls, concrete roofs') },
        { label: L('الموقع', 'Site'), value: L('فرق منسوب 9 أمتار، ولم تُقطع أي شجرة', 'A 9 m fall across the site; no tree removed') },
      ],
      drawing: 'terraces',
    },
    {
      slug: 'hittin-residence',
      number: '04',
      year: '2026',
      name: L('مسكن حطين', 'Hittin Residence'),
      location: L('حي حطين، الرياض', 'Hittin, Riyadh'),
      type: L('فيلا سكنية خاصة', 'Private villa'),
      area: L('420 م²', '420 m²'),
      status: L('قيد التصميم', 'In design'),
      scope: L('التصميم المعماري · التصميم الداخلي · تنسيق الموقع · النمذجة ثلاثية الأبعاد', 'Architecture · Interior design · Landscape · 3D modelling'),
      summary: L('المسكن الذي تتجوّل فيه في هذا الموقع: مغلق على الشارع شمالًا، ومفتوح بالكامل على الفناء والمسبح جنوبًا.', 'The house you walk through on this site: closed to the street on the north, fully open to the terrace and pool on the south.'),
      concept: L(
        'جدار شمالي مصمت إلا من فتحات علوية تغسل السقف بالضوء، وواجهة جنوبية زجاجية يحميها سقف يتقدّمها بمتر ونصف. المدخل من رواق غربي مظلّل، هو الليوان الذي يحمل الاستوديو اسمه، وفوق المطبخ كتلة علوية لغرف النوم. المشروع ما زال في مرحلة التصميم، ولذلك فكل ما تراه هنا مأخوذ من النموذج لا من الموقع.',
        'A north wall closed except for high slots that wash the ceiling with light, and a glazed south face protected by a roof that oversails it by a metre and a half. You enter through a shaded western portico, the liwan the studio is named after, and the bedrooms sit in an upper volume over the kitchen. The project is still in design, so everything shown here comes from the model, not from site.',
      ),
      exterior: L('حجر جيري منشور على الجدران، وبلاطة سقف خرسانية رفيعة ببروز عميق، وزعانف رأسية تظلّل الواجهة الشرقية.', 'Sawn limestone walls, a thin concrete roof slab with deep eaves, and vertical fins shading the east face.'),
      interior: L('فراغ واحد يجمع المعيشة والطعام والمطبخ، بأرضية من البلوط وجدران بلون الجير الدافئ، وكل تشطيب فيه قابل للتغيير في النموذج.', 'One room for living, dining and kitchen, with an oak floor and warm lime-white walls; every finish in it can be changed in the model.'),
      plan: L('البهو غربًا، والمعيشة في الوسط، والمطبخ شرقًا؛ وكلها تنفتح على شرفة ومسبح بطول اثني عشر مترًا.', 'Foyer to the west, living in the middle, kitchen to the east, all opening onto a terrace and a twelve-metre pool.'),
      materials: [
        { name: L('حجر جيري منشور', 'Sawn limestone'), note: L('للواجهات، ويمكن تغييره في النموذج', 'Facades; can be changed in the model') },
        { name: L('ترافرتين', 'Travertine'), note: L('للشرفة وحواف المسبح', 'The terrace and pool coping') },
        { name: L('بلوط', 'Oak'), note: L('للأرضيات وخزائن المطبخ', 'Floors and kitchen cabinetry') },
        { name: L('برونز', 'Bronze'), note: L('للمقابض والتفاصيل المعدنية', 'Handles and metalwork') },
      ],
      specs: [
        { label: L('مساحة الأرض', 'Plot'), value: L('1,500 م²', '1,500 m²') },
        { label: L('مسطّح البناء', 'Built area'), value: L('420 م²', '420 m²') },
        { label: L('الأدوار', 'Storeys'), value: L('دوران', 'Two') },
        { label: L('غرف النوم', 'Bedrooms'), value: L('4', '4') },
        { label: L('التزجيج', 'Glazing'), value: L('زجاج مزدوج منخفض الانبعاثية بكامل الارتفاع', 'Full-height double glazing, low-E') },
        { label: L('التظليل', 'Shading'), value: L('بروز سقف 1.5 م وزعانف رأسية شرقًا', '1.5 m roof overhang, vertical fins to the east') },
      ],
      drawing: 'model',
    },
  ],

  materialsSection: {
    label: L('المواد', 'Materials'),
    title: L('ثماني مواد، لا غير.', 'Eight materials. Nothing else.'),
    intro: L(
      'لوحة مواد قصيرة تتكرّر في كل مكان هي ما يجعل البيت متماسكًا. هذه هي المواد التي نعود إليها دائمًا، وما نستخدم كلًّا منها فيه.',
      'A short palette, used everywhere, is what makes a house feel resolved. These are the ones we keep returning to, and what each is for.',
    ),
    items: [
      { id: 'travertine', name: L('ترافرتين', 'Travertine'), use: L('الأرضيات · الشرفات · حواف المسابح', 'Floors · terraces · pool coping'), note: L('مملوء ومصقول صقلًا مطفيًا. دافئ تحت القدم، ويحتمل الخدش دون أن يبدو تالفًا.', 'Filled and honed. Warm underfoot, and it takes a chip without looking damaged.') },
      { id: 'oak', name: L('بلوط', 'Oak'), use: L('الأرضيات · النجارة · السلالم', 'Floors · joinery · stairs'), note: L('منشور طوليًا ومزيّت لا مطليّ، ليُصلَح في مكانه متى احتاج.', 'Rift sawn and oiled, never lacquered, so it can be repaired in place.') },
      { id: 'marble', name: L('رخام', 'Marble'), use: L('أسطح المطابخ · دورات المياه · درج واحد', 'Worktops · bathrooms · one stair'), note: L('ألواح متقابلة من كتلة واحدة؛ فهي الطريقة الوحيدة لتتّفق العروق.', 'Book matched from a single block, which is the only way the veins agree.') },
      { id: 'limestone', name: L('حجر جيري', 'Limestone'), use: L('الواجهات · أسوار الحدائق', 'Facades · garden walls'), note: L('مدقوق حيث تقع عليه الشمس، ومنشور ناعم حيث تقع عليه اليد.', 'Bush hammered where the sun lands, sawn smooth where hands do.') },
      { id: 'concrete', name: L('خرسانة', 'Concrete'), use: L('الهيكل · بلاطات الأسقف', 'Structure · roof slabs'), note: L('تُصبّ على ألواح خشبية منشورة. القالب هو التشطيب، فيُخطَّط بدقة النجارة.', 'Cast against sawn boards. The formwork is the finish, so it is set out like joinery.') },
      { id: 'bronze', name: L('برونز', 'Bronze'), use: L('المقابض · السواتر · الإطارات', 'Handles · screens · frames'), note: L('يُترك ليتعتّق، فيغمق حيث تلمسه اليد، وهذا هو المقصود.', 'Left to patinate. It darkens where it is touched, which is the point.') },
      { id: 'glass', name: L('زجاج', 'Glass'), use: L('الواجهات الجنوبية', 'South elevations'), note: L('منخفض الحديد كي لا تصبغ حافته الخضراء المنظر، ومنخفض الانبعاثية ليردّ حرارة الصيف.', 'Low iron, so the green edge does not tint the view, and low-E, to turn back the summer heat.') },
      { id: 'walnut', name: L('جوز', 'Walnut'), use: L('المطابخ · الأبواب · الطاولات', 'Kitchens · doors · tables'), note: L('نخصّصه للغرف التي يُجلس فيها، لا التي يُعبر منها.', 'Kept for the rooms you sit in rather than pass through.') },
    ],
  },

  servicesSection: {
    label: L('ما نقدّمه', 'What we do'),
    title: L('من أول خطّ إلى تسليم المفتاح.', 'From the first sketch to the keys.'),
    items: [
      { n: '01', name: L('التصميم المعماري', 'Architecture'), text: L('من الفكرة إلى الإنجاز، بما في ذلك المخططات التنفيذية التي يبني منها المقاول فعلًا.', 'Concept to completion, including the drawings the contractor actually builds from.') },
      { n: '02', name: L('التصميم الداخلي', 'Interior design'), text: L('يُوصَّف في النموذج نفسه مع المبنى، فتلتقي النجارة بالجدار كما ينبغي.', 'Specified in the same model as the building, so the joinery meets the wall correctly.') },
      { n: '03', name: L('تصميم الفلل', 'Villa design'), text: L('بيت واحد ومالك واحد وأرض واحدة، تُدرس كما تستحق.', 'One house, one client, one site, studied properly.') },
      { n: '04', name: L('المجمّعات السكنية', 'Residential development'), text: L('مشاريع متعددة الوحدات، من دراسة الجدوى إلى التسليم.', 'Multi-unit schemes, from feasibility to handover.') },
      { n: '05', name: L('تنسيق المواقع', 'Landscape'), text: L('الزراعة والماء والظل تُصمَّم مع المخطّط، لا بعده.', 'Planting, water and shade designed with the plan, not after it.') },
      { n: '06', name: L('النمذجة ثلاثية الأبعاد', '3D modelling'), text: L('النموذج الذي تراه في هذا الموقع؛ نبني مثله لكل مشروع نتولّاه.', 'The model you see on this site. We build one for every project we take.') },
      { n: '07', name: L('تخصيص الوحدات', 'Property customisation'), text: L('يختار المشتري تشطيباته داخل النموذج، ويعتمد ما رآه بعينه.', 'Buyers choose finishes in the model and sign off what they have seen.') },
      { n: '08', name: L('الإشراف والتسليم', 'Supervision and handover'), text: L('إشراف على الموقع، وتوريد، وتسليم كامل مع المفتاح.', 'Site supervision, procurement and handover with the keys.') },
    ],
  },

  studioStory: {
    label: L('الاستوديو', 'Studio'),
    title: L('استوديو صغير، عن قصد.', 'A small studio, deliberately.'),
    body: [
      L(
        'تأسّس ليوان في الرياض عام 2009. نتولّى أربعة مشاريع في السنة لا أكثر؛ لأن الرسومات المهمة هي التي تُنجز على مهل، ولأن المعماري الذي تقابله في الاجتماع الأول ينبغي أن يكون هو من يرسم تفاصيل بيتك.',
        'LIWAN was founded in Riyadh in 2009. We take four projects a year and no more, because the drawings that matter are the ones done slowly, and because the architect you meet should be the one who details your house.',
      ),
      L(
        'نعمل بين أمرين: بيت الفناء الذي حسمت هذه المنطقة أمره منذ قرون، وطريقة العيش اليوم بفراغاتها المفتوحة وزجاجها الواسع وسياراتها وتكييفها. ومعظم عملنا حوارٌ بين الاثنين.',
        'We work between two things: the courtyard house, which this region solved centuries ago, and the way people live now, with open plans, long glass, cars and air conditioning. Most of our work is the conversation between the two.',
      ),
    ],
    definition: {
      term: L('الليوان', 'Liwan'),
      text: L('رواقٌ مسقوف ينفتح على الفناء: ظلٌّ من جهة، وشمسٌ من الأخرى، وعتبةٌ بينهما.', 'A roofed hall open to the courtyard: shade on one side, sun on the other, and a threshold between.'),
    },
    facts: [
      { value: L('2009', '2009'), label: L('سنة التأسيس', 'Founded') },
      { value: L('الرياض', 'Riyadh'), label: L('المقر', 'Based in') },
      { value: L('11', '11'), label: L('معماريًا ومصممًا', 'Architects and designers') },
      { value: L('4', '4'), label: L('مشاريع في السنة', 'Projects a year') },
    ],
  },

  contact: {
    label: L('ابدأ مشروعك', 'Start a project'),
    title: L('حدّثنا عن أرضك.', 'Tell us about the site.'),
    text: L('يكفينا للبداية رقم القطعة وبضع صور. وسنخبرك بصراحة إن كنّا الاستوديو المناسب لها.', 'A plot number and a few photographs are enough to begin. We will tell you honestly whether we are the right studio for it.'),
    fields: {
      name: L('الاسم', 'Name'),
      email: L('البريد الإلكتروني', 'Email'),
      location: L('أين تقع الأرض؟', 'Where is the site?'),
      brief: L('ما الذي تفكّر في بنائه؟', 'What are you thinking of building?'),
    },
    spec: L('المواصفات التي اخترتها في النموذج ستُرفق بالرسالة.', 'The specification you chose in the model will be attached to the message.'),
    send: L('جهّز الرسالة', 'Prepare the email'),
    sent: L('فتحنا لك رسالة جاهزة في بريدك؛ أرسلها لتصلنا.', 'A ready-written email has opened in your mail app. Send it and it reaches us.'),
    direct: L('أو راسلنا مباشرة', 'Or write to us directly'),
    subject: L('مشروع جديد', 'New project'),
  },

  footer: {
    studio: L('الاستوديو', 'Studio'),
    contact: L('تواصل', 'Contact'),
    concept: L('ليوان استوديو تخيّلي، صُمّم وبُني عملًا استعراضيًا. المشاريع والأرقام غير حقيقية.', 'LIWAN is a fictional studio, designed and built as a demonstration. Projects and figures are not real.'),
    credits: L('صور المشاريع صور مرجعية من Unsplash، وحقوقها لمصوّريها. النموذج ثلاثي الأبعاد مرسوم بالكامل بالشيفرة.', 'Project photographs are reference images from Unsplash and belong to their photographers. The 3D model is drawn entirely in code.'),
    creditsLink: L('قائمة المصوّرين', 'Photo credits'),
  },
};

/* ── Resolution ───────────────────────────────────────────── */

type Resolved<X> = X extends T ? string : X extends readonly (infer U)[] ? Resolved<U>[] : X extends object ? { [K in keyof X]: Resolved<X[K]> } : X;

const isPair = (value: unknown): value is T =>
  typeof value === 'object' && value !== null && Object.keys(value).length === 2 && typeof (value as T).ar === 'string' && typeof (value as T).en === 'string';

function resolve<X>(value: X, locale: Locale): Resolved<X> {
  if (isPair(value)) return value[locale] as Resolved<X>;
  if (Array.isArray(value)) return value.map((item) => resolve(item, locale)) as Resolved<X>;
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolve(item, locale)])) as Resolved<X>;
  }
  return value as Resolved<X>;
}

export type Content = Resolved<typeof source>;
export type Project = Content['projects'][number];
export type DrawingId = 'courtyard' | 'atrium' | 'terraces' | 'model';

export const content: Record<Locale, Content> = { ar: resolve(source, 'ar'), en: resolve(source, 'en') };
export const projectSlugs = source.projects.map((project) => project.slug);
