// 五十五座看不见的城市 — 数据层
// 主题分类依据原著意大利语维基百科章节结构

export type ThemeId =
  | 'memory'
  | 'desire'
  | 'signs'
  | 'thin'
  | 'trade'
  | 'eyes'
  | 'names'
  | 'dead'
  | 'sky'
  | 'continuous'
  | 'hidden'

export interface Theme {
  id: ThemeId
  name: string
  latin: string
  motif: string
  color: string
  emblem: string
  epigraph: string
  blurb: string
}

export interface City {
  id: string
  it: string
  zh: string
  theme: ThemeId
  n: number
  chapter: number
  seed: number
  motto: string
  note: string
}

export const THEMES: Theme[] = [
  {
    id: 'memory',
    name: '城市与记忆',
    latin: 'Le città e la memoria',
    motif: '记忆',
    color: '#C45C3E',
    emblem: '残片',
    epigraph: '抵达每一座新城，旅人总会重逢一段他不曾知道自己拥有的过去。',
    blurb: '记忆让城市长出第二层轮廓：一层是砖石，一层是回声。',
  },
  {
    id: 'desire',
    name: '城市与欲望',
    latin: 'Le città e il desiderio',
    motif: '欲望',
    color: '#B85A4A',
    emblem: '螺旋',
    epigraph: '欲望的城总在前方半步，永远差一次抵达。',
    blurb: '欲望是城市的引擎，也是它永不竣工的原因。',
  },
  {
    id: 'signs',
    name: '城市与符号',
    latin: 'Le città e i segni',
    motif: '符号',
    color: '#8B6B4A',
    emblem: '镜片',
    epigraph: '城市用符号说话，而符号总是比它想说的多一点。',
    blurb: '当符号挤满街道，人反而学会了沉默。',
  },
  {
    id: 'thin',
    name: '轻盈的城市',
    latin: 'Le città sottili',
    motif: '轻盈',
    color: '#6B8F9E',
    emblem: '细丝',
    epigraph: '轻盈不是轻浮，是把重量藏进结构里。',
    blurb: '这些城几乎不存在——它们只是一些坚持。',
  },
  {
    id: 'trade',
    name: '贸易的城市',
    latin: 'Le città e gli scambi',
    motif: '贸易',
    color: '#A67C52',
    emblem: '桥梁',
    epigraph: '贸易之城用货物交换故事，用故事交换货物。',
    blurb: '市场是城市的语法：人来人往，句子才成其为句子。',
  },
  {
    id: 'eyes',
    name: '城市与眼睛',
    latin: 'Le città e gli occhi',
    motif: '眼睛',
    color: '#5C7A8A',
    emblem: '环视',
    epigraph: '你看见的城与被看见的城，并不是同一座。',
    blurb: '在眼睛之城，观看本身是一种建筑。',
  },
  {
    id: 'names',
    name: '城市与名字',
    latin: 'Le città e il nome',
    motif: '名字',
    color: '#7A6B8A',
    emblem: '字碑',
    epigraph: '名字先于城抵达，也常比城活得更久。',
    blurb: '叫得出名字的城，才真正开始被想象。',
  },
  {
    id: 'dead',
    name: '城市与死亡',
    latin: 'Le città e i morti',
    motif: '死亡',
    color: '#6B6B6B',
    emblem: '下沉',
    epigraph: '死者的城并不阴森——它只是不再假装永恒。',
    blurb: '城市把死亡安排在地基里，好让活着的人继续走。',
  },
  {
    id: 'sky',
    name: '城市与天空',
    latin: 'Le città e il cielo',
    motif: '天空',
    color: '#7A9EAA',
    emblem: '升环',
    epigraph: '每座城都画了自己的天——有的是井，有的是穹。',
    blurb: '仰望的姿势，决定了城市的高度。',
  },
  {
    id: 'continuous',
    name: '连绵的城市',
    latin: 'Le città continue',
    motif: '连绵',
    color: '#8A7A5C',
    emblem: '网格',
    epigraph: '连绵之城没有城外——或者说，城外只是另一段城。',
    blurb: '当城市无限延长，边界就成了记忆。',
  },
  {
    id: 'hidden',
    name: '隐蔽的城市',
    latin: 'Le città nascoste',
    motif: '隐蔽',
    color: '#5C6B5C',
    emblem: '围合',
    epigraph: '最深的城藏在看不见的褶皱里，包括你自己的那一座。',
    blurb: '隐蔽不是消失，是换一种方式在场。',
  },
]

export const CITIES: City[] = [
  // ── 城市与记忆 ─────────────────────────────
  {
    id: 'diomira', it: 'Diomira', zh: '迪奥米拉', theme: 'memory', n: 1, chapter: 1,
    seed: 11,
    motto: '黄昏的斜光把每扇窗变成一格被唤醒的记忆。',
    note: '一座在抵达时才显影的城：你认出的不是街巷，而是自己遗忘过的姿态。',
  },
  {
    id: 'isidora', it: 'Isidora', zh: '伊西多拉', theme: 'memory', n: 2, chapter: 1,
    seed: 12,
    motto: '山上的城，风把过去吹成阶梯。',
    note: '人们因回忆而登高，却在半山发现回忆也在登高。',
  },
  {
    id: 'zaira', it: 'Zaira', zh: '扎伊拉', theme: 'memory', n: 3, chapter: 1,
    seed: 13,
    motto: '城市的过去像一叠被压紧的纸，边角仍在生长。',
    note: '每一块石头都是一页未拆的信，街道则是人们写下的批注。',
  },
  {
    id: 'zora', it: 'Zora', zh: '佐拉', theme: 'memory', n: 4, chapter: 1,
    seed: 14,
    motto: '有些城一旦见过，就再也无法忘记——包括你想忘的。',
    note: '佐拉的建筑按记忆排列，于是任何人都能原路走回自己的某一天。',
  },
  {
    id: 'maurilia', it: 'Maurilia', zh: '莫里利亚', theme: 'memory', n: 5, chapter: 2,
    seed: 15,
    motto: '用旧明信片打量新城，是一种危险的温柔。',
    note: '莫里利亚人热爱他们的过去，前提是可以跟过去保持礼貌距离。',
  },

  // ── 城市与欲望 ─────────────────────────────
  {
    id: 'dorotea', it: 'Dorotea', zh: '多萝泰亚', theme: 'desire', n: 1, chapter: 1,
    seed: 21,
    motto: '欲望有两种：抵达之前，和抵达之后。',
    note: '多萝泰亚把这两种欲望分别砌进两座城，中间只隔一道桥。',
  },
  {
    id: 'anastasia', it: 'Anastasia', zh: '阿纳斯塔西亚', theme: 'desire', n: 2, chapter: 1,
    seed: 22,
    motto: '欲望之网在清晨张开，黄昏时已捕住整座城。',
    note: '你以为自己在生活，其实是在为这座城的欲望提供细节。',
  },
  {
    id: 'despina', it: 'Despina', zh: '德斯皮娜', theme: 'desire', n: 3, chapter: 1,
    seed: 23,
    motto: '对来者是港口，对去者是骆驼——城在两端长得不一样。',
    note: '德斯皮娜是一面双刃的镜子，欲望决定了你从哪一侧照见它。',
  },
  {
    id: 'fedora', it: 'Fedora', zh: '费多拉', theme: 'desire', n: 4, chapter: 2,
    seed: 24,
    motto: '每座城中心都有一座未被选择的它自己。',
    note: '费多拉用博物馆保存那些「本可以」的城，于是现实成了副本。',
  },
  {
    id: 'zobeide', it: 'Zobeide', zh: '佐贝伊德', theme: 'desire', n: 5, chapter: 3,
    seed: 25,
    motto: '追逐同一个梦的人，醒来后一起把梦砌成了墙。',
    note: '街道的走向服从梦的逻辑，于是整座城成了一个尚未醒来的句子。',
  },

  // ── 城市与符号 ─────────────────────────────
  {
    id: 'tamara', it: 'Tamara', zh: '塔玛拉', theme: 'signs', n: 1, chapter: 1,
    seed: 31,
    motto: '城里满是符号，人却越来越难说出它们的意思。',
    note: '眼睛在塔玛拉不停做减法：看见什么，便要解释什么。',
  },
  {
    id: 'zirma', it: 'Zirma', zh: '齐尔玛', theme: 'signs', n: 2, chapter: 1,
    seed: 32,
    motto: '重复的符号不是啰嗦，是焦虑。',
    note: '齐尔玛用无尽的标记安抚旅人：你仍走在已知的路上。',
  },
  {
    id: 'zoe', it: 'Zoe', zh: '佐埃', theme: 'signs', n: 3, chapter: 2,
    seed: 33,
    motto: '生命若可被指认，那它就还剩多少神秘？',
    note: '佐埃人给一切贴标签，直到标签本身长成了新的生物。',
  },
  {
    id: 'ipazia', it: 'Ipazia', zh: '伊帕齐娅', theme: 'signs', n: 4, chapter: 3,
    seed: 34,
    motto: '符号指向远方，城却在近处发亮。',
    note: '伊帕齐娅的美不在符号里，而在符号与符号之间的沉默。',
  },
  {
    id: 'olivia', it: 'Olivia', zh: '奥利维亚', theme: 'signs', n: 5, chapter: 4,
    seed: 35,
    motto: '名字可以更换，城的性格却藏在石头的纹理里。',
    note: '奥利维亚证明：符号可以撒谎，材料不会。',
  },

  // ── 轻盈的城市 ─────────────────────────────
  {
    id: 'isaura', it: 'Isaura', zh: '伊萨乌拉', theme: 'thin', n: 1, chapter: 1,
    seed: 41,
    motto: '井是城市的句号，也是它的起点。',
    note: '伊萨乌拉建在深渊之上，于是「向下」成了最奢侈的方向。',
  },
  {
    id: 'zenobia', it: 'Zenobia', zh: '珍诺比亚', theme: 'thin', n: 2, chapter: 2,
    seed: 42,
    motto: '高脚的城市把重量交给风。',
    note: '珍诺比亚轻得像一个尚未写完的假设。',
  },
  {
    id: 'armilla', it: 'Armilla', zh: '阿尔米拉', theme: 'thin', n: 3, chapter: 3,
    seed: 43,
    motto: '没有完工的城，反而保留了全部可能。',
    note: '水管仍在滴水——有人住在想象里，比住进建筑更久。',
  },
  {
    id: 'sofronia', it: 'Sofronia', zh: '索芙洛妮娅', theme: 'thin', n: 4, chapter: 4,
    seed: 44,
    motto: '两座城轮流上场，谁也不承认自己是临时的。',
    note: '轻盈来自随时可以被替换的自觉。',
  },
  {
    id: 'ottavia', it: 'Ottavia', zh: '奥克塔维亚', theme: 'thin', n: 5, chapter: 5,
    seed: 45,
    motto: '悬在深渊上的网，就是城的全部地基。',
    note: '奥克塔维亚人学会了：不掉下去，就是建设。',
  },

  // ── 贸易的城市 ─────────────────────────────
  {
    id: 'eufemia', it: 'Eufemia', zh: '欧菲米亚', theme: 'trade', n: 1, chapter: 2,
    seed: 51,
    motto: '每年一次的集市，交换的其实是记忆的汇率。',
    note: '商人在欧菲米亚买卖故事，回家后用故事换取安睡。',
  },
  {
    id: 'cloe', it: 'Cloe', zh: '克洛埃', theme: 'trade', n: 2, chapter: 3,
    seed: 52,
    motto: '目光相遇又错开，城便在这错开里呼吸。',
    note: '克洛埃的贸易不是货物，是被允许的短暂关注。',
  },
  {
    id: 'eutropia', it: 'Eutropia', zh: '欧特罗皮亚', theme: 'trade', n: 3, chapter: 4,
    seed: 53,
    motto: '角色在城中轮换，城市因此永不过时。',
    note: '欧特罗皮亚交换的不是商品，是命运的站位。',
  },
  {
    id: 'ersilia', it: 'Ersilia', zh: '埃尔西莉亚', theme: 'trade', n: 4, chapter: 5,
    seed: 54,
    motto: '人与人之间的线，比城墙更早定义一座城。',
    note: '当线剪断，城就消失；当线增多，城就扩张。',
  },
  {
    id: 'smeraldina', it: 'Smeraldina', zh: '斯梅拉尔迪娜', theme: 'trade', n: 5, chapter: 6,
    seed: 55,
    motto: '水道是城市的括号，把两岸括成一句话。',
    note: '在斯梅拉尔迪娜，走路就是在书写一条关于相遇的注释。',
  },

  // ── 城市与眼睛 ─────────────────────────────
  {
    id: 'valdrada', it: 'Valdrada', zh: '瓦尔德拉达', theme: 'eyes', n: 1, chapter: 3,
    seed: 61,
    motto: '湖面把城倒过来，好让人看清自己的姿势。',
    note: '瓦尔德拉达的双生不是对称，是彼此监督。',
  },
  {
    id: 'zemrude', it: 'Zemrude', zh: '泽姆鲁德', theme: 'eyes', n: 2, chapter: 4,
    seed: 62,
    motto: '城的样子，取决于你从哪一层情绪俯瞰它。',
    note: '沉重时它是井，轻盈时它是云——城从未改变。',
  },
  {
    id: 'bauci', it: 'Bauci', zh: '鲍西斯', theme: 'eyes', n: 3, chapter: 5,
    seed: 63,
    motto: '高脚之城向下看见的，是自己的影子。',
    note: '鲍西斯人居住在天空，地面上只有柱子的注脚。',
  },
  {
    id: 'fillide', it: 'Fillide', zh: '菲莉德', theme: 'eyes', n: 4, chapter: 6,
    seed: 64,
    motto: '你看见的城，是你的目光画出来的。',
    note: '菲莉德只对凝视它的人显形，转头即换一副面孔。',
  },
  {
    id: 'moriana', it: 'Moriana', zh: '莫里亚娜', theme: 'eyes', n: 5, chapter: 7,
    seed: 65,
    motto: '正面是镀金的笑，背面是水管的叹息。',
    note: '莫里亚娜教会旅人：任何光鲜的立面，都有一个不被拍摄的背面。',
  },

  // ── 城市与名字 ─────────────────────────────
  {
    id: 'aglaura', it: 'Aglaura', zh: '阿格劳拉', theme: 'names', n: 1, chapter: 4,
    seed: 71,
    motto: '城里的语言分两种：说出口的，和砌进墙里的。',
    note: '阿格劳拉的石头会说话，但说的永远是另一种方言。',
  },
  {
    id: 'leandra', it: 'Leandra', zh: '莱安德拉', theme: 'names', n: 2, chapter: 5,
    seed: 72,
    motto: '名字被管理，记忆就会改道。',
    note: '莱安德拉人相信：改名可以改命，于是城被改得面目模糊。',
  },
  {
    id: 'pirra', it: 'Pirra', zh: '皮拉', theme: 'names', n: 3, chapter: 6,
    seed: 73,
    motto: '刻在石上的名字，比叫出的名字更顽固。',
    note: '皮拉用铭文抵抗遗忘，结果铭文自己成了新的神祇。',
  },
  {
    id: 'clarice', it: 'Clarice', zh: '克拉莉丝', theme: 'names', n: 4, chapter: 7,
    seed: 74,
    motto: '新城在旧城的废墟上，仍用旧城的名字说话。',
    note: '克拉莉丝不断重建自己，只有名字是不肯让位的居民。',
  },
  {
    id: 'irene', it: 'Irene', zh: '伊蕾妮', theme: 'names', n: 5, chapter: 8,
    seed: 75,
    motto: '远看是一座城，近看是无数句「差不多」。',
    note: '伊蕾妮拒绝被准确描述——她认为那是另一种暴力。',
  },

  // ── 城市与死亡 ─────────────────────────────
  {
    id: 'melania', it: 'Melania', zh: '梅拉尼亚', theme: 'dead', n: 1, chapter: 5,
    seed: 81,
    motto: '角色在城里循环，死亡只是换一顶面具。',
    note: '梅拉尼亚的永恒不在建筑，在剧本的重复上演。',
  },
  {
    id: 'adelma', it: 'Adelma', zh: '阿德尔玛', theme: 'dead', n: 2, chapter: 6,
    seed: 82,
    motto: '在死者的城里，每个面孔都像一位故人。',
    note: '阿德尔玛让旅人怀疑：死亡与陌生，哪一个更接近真实。',
  },
  {
    id: 'eusapia', it: 'Eusapia', zh: '欧萨皮亚', theme: 'dead', n: 3, chapter: 7,
    seed: 83,
    motto: '地下城与地上城彼此模仿，直到分不清谁更活。',
    note: '欧萨皮亚的居民为死者修城，修着修着就修成了自己的墓志铭。',
  },
  {
    id: 'argia', it: 'Argia', zh: '阿尔吉亚', theme: 'dead', n: 4, chapter: 8,
    seed: 84,
    motto: '一座完全由尘土构成的城，比石头更懂得沉默。',
    note: '阿尔吉亚在地下呼吸，地面上只剩它的梦的轮廓。',
  },
  {
    id: 'laudomia', it: 'Laudomia', zh: '劳多米亚', theme: 'dead', n: 5, chapter: 9,
    seed: 85,
    motto: '每座活人都有一座死者的孪生城，共用同一张地图。',
    note: '劳多米亚人定期拜访自己未来的住址，好让死亡不那么突然。',
  },

  // ── 城市与天空 ─────────────────────────────
  {
    id: 'eudossia', it: 'Eudossia', zh: '欧多西亚', theme: 'sky', n: 1, chapter: 6,
    seed: 91,
    motto: '地毯上织着城市的命运，也织着它的反驳。',
    note: '欧多西亚把天意铺在地上，好让人们在行走中阅读。',
  },
  {
    id: 'bersabea', it: 'Bersabea', zh: '贝尔萨贝亚', theme: 'sky', n: 2, chapter: 7,
    seed: 92,
    motto: '相信天上有城的人，会把地面建成脚注。',
    note: '贝尔萨贝亚的石匠穷尽一生，只为让尘世配得上那座看不见的天上城。',
  },
  {
    id: 'tecla', it: 'Tecla', zh: '泰克拉', theme: 'sky', n: 3, chapter: 8,
    seed: 93,
    motto: '城永远在开工，天空永远在评审。',
    note: '泰克拉人接受：完工是一种傲慢，天空不喜欢被冒犯。',
  },
  {
    id: 'perinzia', it: 'Perinzia', zh: '佩林齐亚', theme: 'sky', n: 4, chapter: 9,
    seed: 94,
    motto: '天与地之间，城市学会了说模棱两可的话。',
    note: '佩林齐亚的街道既通向集市，也通向一个关于起源的比喻。',
  },
  {
    id: 'andria', it: 'Andria', zh: '安德里亚', theme: 'sky', n: 5, chapter: 9,
    seed: 95,
    motto: '每一条街都按星辰排列——包括那些还没被命名的星。',
    note: '安德里亚用建筑追踪天象，于是城市本身成了一台缓慢的仪器。',
  },

  // ── 连绵的城市 ─────────────────────────────
  {
    id: 'leonia', it: 'Leonia', zh: '莱奥尼亚', theme: 'continuous', n: 1, chapter: 7,
    seed: 101,
    motto: '每天丢弃昨天，城便永远崭新，也永远空洞。',
    note: '莱奥尼亚的边界由垃圾堆成——那些被它拒绝的过去。',
  },
  {
    id: 'trude', it: 'Trude', zh: '特鲁德', theme: 'continuous', n: 2, chapter: 8,
    seed: 102,
    motto: '所有的城都长一样，直到你开始怀疑城的概念。',
    note: '特鲁德没有终点：抵达即出发，出发即抵达。',
  },
  {
    id: 'procopia', it: 'Procopia', zh: '普罗科皮亚', theme: 'continuous', n: 3, chapter: 9,
    seed: 103,
    motto: '居民的密度，决定城市的性格。',
    note: '普罗科皮亚用人口书写它的宪法：拥挤是它的信仰。',
  },
  {
    id: 'cecilia', it: 'Cecilia', zh: '切奇莉亚', theme: 'continuous', n: 4, chapter: 9,
    seed: 104,
    motto: '河流把城分段，每段都以为自己是全部。',
    note: '切奇莉亚证明：连绵不是一体，是无数个「下一章」。',
  },
  {
    id: 'pentesilea', it: 'Pentesilea', zh: '潘忒西莱亚', theme: 'continuous', n: 5, chapter: 9,
    seed: 105,
    motto: '新与旧在城中互相缠绕，谁也不肯退场。',
    note: '潘忒西莱亚的街道同时是工地和废墟——连绵因此有了时间的厚度。',
  },

  // ── 隐蔽的城市 ─────────────────────────────
  {
    id: 'olinda', it: 'Olinda', zh: '奥琳达', theme: 'hidden', n: 1, chapter: 8,
    seed: 111,
    motto: '城中心藏着一个更小、更精确的自己。',
    note: '奥琳达像洋葱：剥到最后，是同一座城的无限递归。',
  },
  {
    id: 'raissa', it: 'Raissa', zh: '拉伊萨', theme: 'hidden', n: 2, chapter: 9,
    seed: 112,
    motto: '在不幸的城市里，总有一丝幸福不被登记。',
    note: '拉伊萨的隐秘不在建筑，在人们互相点亮的微小瞬间。',
  },
  {
    id: 'marozia', it: 'Marozia', zh: '马罗齐亚', theme: 'hidden', n: 3, chapter: 9,
    seed: 113,
    motto: '两种生命在城里交叉，一种向上，一种向下。',
    note: '马罗齐亚的隐蔽是一种生物学：树根与屋顶共享同一套欲望。',
  },
  {
    id: 'teodora', it: 'Teodora', zh: '泰奥多拉', theme: 'hidden', n: 4, chapter: 9,
    seed: 114,
    motto: '被消灭的动物，换一种身体继续住在这里。',
    note: '泰奥多拉证明：隐蔽可以是演化，而演化从不真正清场。',
  },
  {
    id: 'berenice', it: 'Berenice', zh: '贝蕾妮丝', theme: 'hidden', n: 5, chapter: 9,
    seed: 115,
    motto: '正义之城里，看不见的不义也在建自己的街区。',
    note: '贝蕾妮丝的隐蔽最为难堪：公正与残酷共用同一套下水道。',
  },
]

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(
  CITIES.map((c) => [c.id, c])
)
export const THEME_BY_ID: Record<string, Theme> = Object.fromEntries(
  THEMES.map((t) => [t.id, t])
)

export function citiesOfTheme(themeId: string): City[] {
  return CITIES.filter((c) => c.theme === themeId)
}

// 入场顺序（原著章节流）
export const CHAPTER_FLOW = [
  { chapter: 1, title: '第一部 · 御前', caption: '大汗听着，帝国在语言里显影。' },
  { chapter: 2, title: '第二部 · 初见', caption: '五座城，像五枚尚未落下的棋子。' },
  { chapter: 3, title: '第三部 · 对照', caption: '欲望退潮，符号开始涨水。' },
  { chapter: 4, title: '第四部 · 翻面', caption: '轻盈与名字交换彼此的影子。' },
  { chapter: 5, title: '第五部 · 中央', caption: '鲍西斯悬在书页的正中，像一枚轴心。' },
  { chapter: 6, title: '第六部 · 背面', caption: '死亡与天空，共用同一种仰望。' },
  { chapter: 7, title: '第七部 · 外围', caption: '连绵开始，边界开始融化。' },
  { chapter: 8, title: '第八部 · 转折', caption: '名字完成使命，隐蔽接手叙事。' },
  { chapter: 9, title: '第九部 · 回声', caption: '对话归来，城市在棋盘上慢慢变淡。' },
]
