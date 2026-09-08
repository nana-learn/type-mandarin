export const LEVELS = ["hsk1", "hsk2", "hsk3", "hsk4"] as const;

export type Level = (typeof LEVELS)[number];

export type Passage = {
  id: string;
  title: string;
  level: Level;
  text: string;
};

export const LEVEL_LABELS: Record<Level, string> = {
  hsk1: "HSK 1",
  hsk2: "HSK 2",
  hsk3: "HSK 3",
  hsk4: "HSK 4",
};

export const PASSAGES: Passage[] = [
  // --- HSK 1 ---
  {
    id: "hsk1-name",
    title: "名字",
    level: "hsk1",
    text: "我叫王小明。我是学生。我今年十八岁。我家在北京。家里有爸爸、妈妈和我。我爱我的家。我的爸爸是老师，我的妈妈是医生。",
  },
  {
    id: "hsk1-school",
    title: "学校",
    level: "hsk1",
    text: "今天天气很好。不冷，也不太热。我去学校学习汉语。学校很大。我的老师很好。同学也很高兴。我喜欢我的学校。",
  },
  {
    id: "hsk1-home",
    title: "在家",
    level: "hsk1",
    text: "现在是下午三点。我在家。我想喝茶。这杯茶很好。我有苹果。我喜欢吃水果。我的猫在桌子上。狗在椅子前面。",
  },
  {
    id: "hsk1-friend",
    title: "朋友",
    level: "hsk1",
    text: "我有一个朋友。她叫李月。她是中国人。她在北京工作。她很高兴。我认识她。我们是好朋友。她喜欢看书，我喜欢看电影。",
  },
  {
    id: "hsk1-shop",
    title: "商店",
    level: "hsk1",
    text: "我去商店买苹果。苹果多少钱？五块钱。我买六个苹果。我也想买茶。茶很好喝。谢谢你！再见！",
  },
  {
    id: "hsk1-hospital",
    title: "医院",
    level: "hsk1",
    text: "请问，医院在哪儿？医院在学校前面。谢谢你。没关系。我去医院。我的朋友在医院工作。她是医生。她很好。",
  },
  {
    id: "hsk1-beijing",
    title: "去北京",
    level: "hsk1",
    text: "明天我去北京。我坐飞机去。今天我在家看书。这本书很好。我喜欢看书。我的爸爸也喜欢看书。他有很多书。",
  },
  {
    id: "hsk1-hello",
    title: "认识你",
    level: "hsk1",
    text: "你好！认识你我很高兴。你叫什么名字？我叫小白。你是学生吗？我是学生。我在中国学习汉语。我很喜欢汉语。",
  },
  {
    id: "hsk1-day",
    title: "今天",
    level: "hsk1",
    text: "我上午去学校，下午在家。我学习汉语，也做中国菜。我喜欢吃饭。米饭和菜都很好。我喝茶，不喝咖啡。水也很好。",
  },
  {
    id: "hsk1-teacher",
    title: "老师",
    level: "hsk1",
    text: "这儿有很多人。那是我的老师。她很漂亮。同学们都喜欢她。我们看书、写字、听汉语。老师说，你们都很好。我很高兴。",
  },
  {
    id: "hsk1-rain",
    title: "下雨",
    level: "hsk1",
    text: "我住在北京。我家不大。有桌子、椅子和书。我有电脑。我喜欢看电影。今天下雨，我在家。天气不太好。我喝茶，看书。",
  },
  {
    id: "hsk1-call",
    title: "打电话",
    level: "hsk1",
    text: "喂，你好！你是李老师吗？我是小明。今天下午我去学校。你在家吗？我不在家。我在商店。好，再见！",
  },

  // --- HSK 2 ---
  {
    id: "hsk2-busy",
    title: "很忙",
    level: "hsk2",
    text: "今天早上我很忙。因为明天有考试，所以我已经学习三个小时了。妈妈给我做了鸡蛋和米饭。虽然有一点儿累，但是我还想再看一会儿书。晚上朋友会来帮助我。",
  },
  {
    id: "hsk2-weekend",
    title: "周末",
    level: "hsk2",
    text: "这个星期六我想去旅行。天气比昨天好，不太冷。我们一起坐火车去。姐姐说那边的山很高，路有点儿远。我准备了水果、水和衣服。我希望玩得高兴。",
  },
  {
    id: "hsk2-work",
    title: "公司",
    level: "hsk2",
    text: "我在一家公司工作。每天早上九点上班，下午五点下班。同事们都很好。经理让我学习电脑。虽然开始的时候有问题，但是现在我已经会了。我喜欢我的工作。",
  },
  {
    id: "hsk2-birthday",
    title: "生日",
    level: "hsk2",
    text: "今天是我弟弟的生日。他今年十岁。我们给他买了蛋糕和一件新衣服。晚上家里来了很多朋友。大家唱歌、跳舞、吃西瓜。弟弟笑了，他真高兴。",
  },
  {
    id: "hsk2-sport",
    title: "运动",
    level: "hsk2",
    text: "我最喜欢的运动是游泳。哥哥喜欢踢足球，姐姐喜欢跑步。每天下午我们一起去学校旁边的运动场。运动完以后，身体很累，但是觉得非常好。",
  },
  {
    id: "hsk2-sick",
    title: "生病",
    level: "hsk2",
    text: "昨天我生病了，有点儿发烧。妈妈让我休息，不要去学校。我们去医院看医生。医生给了我一些药，告诉我多喝水、早一点儿睡觉。今天我已经觉得好多了。",
  },
  {
    id: "hsk2-new-home",
    title: "新房间",
    level: "hsk2",
    text: "我们家有了新房间。房间比以前大。左边是我的桌子，右边是床。从窗户可以看到路和很多树。晚上我喜欢坐在房间里看报纸、看电视。",
  },
  {
    id: "hsk2-why",
    title: "为什么",
    level: "hsk2",
    text: "你为什么学汉语？因为我有中国朋友，所以我想和他们说话。开始的时候我觉得很难，现在已经习惯了。每天我都听一点儿汉语，也看中文电视。我希望明年去北京。",
  },
  {
    id: "hsk2-airport",
    title: "机场",
    level: "hsk2",
    text: "我们要去机场。从家里到机场有点儿远，所以我们坐出租车。我已经准备好票了。飞机是上午十点的。到了机场，我们还得等一个小时。虽然很忙，但是我很高兴。",
  },
  {
    id: "hsk2-color",
    title: "衣服",
    level: "hsk2",
    text: "我喜欢红色的衣服，姐姐喜欢白色的。今天商店的衣服很便宜。我买了一件新的，她买了两条裙子。回到家，我们洗了衣服。晚上还要准备明天的课。",
  },
  {
    id: "hsk2-help",
    title: "帮忙",
    level: "hsk2",
    text: "同学问我题，我告诉他这个意思。他听得不太明白，我就再说一次。因为我们是好朋友，所以我很高兴帮助他。做完以后，我们一起去吃饭。鸡蛋汤真好吃。",
  },
  {
    id: "hsk2-evening",
    title: "晚上",
    level: "hsk2",
    text: "晚上七点，我从公司回来。先洗手，再吃饭。看完新闻，我给妈妈打电话。她问我累不累。我说有一点儿忙，但是还好。睡觉以前，我准备明天要穿的衣服。",
  },

  // --- HSK 3 ---
  {
    id: "hsk3-plan",
    title: "打算",
    level: "hsk3",
    text: "如果这个周末不下雨，我就打算和同事去附近的公园。我们一边走路，一边聊天。最近工作越来越忙，所以我特别需要休息。虽然只有一天时间，但是也应该让自己放松一下。",
  },
  {
    id: "hsk3-exam",
    title: "考试",
    level: "hsk3",
    text: "为了提高汉语成绩，我每天都复习生词和语法。老师让我们把句子读出来，还要听录音。刚开始我听不清楚，后来慢慢明白了。这次考试不但比上次容易，而且我自己也更有信心。",
  },
  {
    id: "hsk3-city",
    title: "城市",
    level: "hsk3",
    text: "我住的城市又方便又热闹。楼下就有超市和地铁站，去图书馆也不远。不过周末人特别多，有时候会觉得有点儿吵。如果想安静一点儿，我就去附近的公园看书，或者在家听音乐。",
  },
  {
    id: "hsk3-habit",
    title: "习惯",
    level: "hsk3",
    text: "来中国以后，我的习惯发生了很大变化。以前晚上十二点才睡觉，现在十一点以前就休息。我还开始锻炼身体，每天早上跑步二十分钟。其实这些事情并不难，重要的是坚持。越坚持，身体就越健康。",
  },
  {
    id: "hsk3-guest",
    title: "客人",
    level: "hsk3",
    text: "明天家里要来几位客人，所以我今天下午把房间打扫干净了。我还去超市买了水果、茶叶和一些简单的菜。他们是从外地来的同事。见面以后，我们不但可以吃饭，而且能一起聊聊最近的工作。",
  },
  {
    id: "hsk3-choose",
    title: "选择",
    level: "hsk3",
    text: "周末我想去博物馆，可是朋友想去看电影。我们讨论了一会儿，最后决定先去博物馆，然后再去吃饭。这样大家都比较满意。其实选择并不难，只要先了解别人的想法，就容易找到办法。",
  },
  {
    id: "hsk3-email",
    title: "电子邮件",
    level: "hsk3",
    text: "经理让我把会议的内容写成电子邮件，发给办公室的同事。我先把重要的问题写清楚，然后再检查一遍。虽然花了不少时间，但是我觉得这样做很有用。别人看完以后，就能明白我们应该怎么完成工作。",
  },
  {
    id: "hsk3-festival",
    title: "节日",
    level: "hsk3",
    text: "春节是中国最重要的节日。人们会回家看望父母，给孩子准备礼物，还要一起吃饭。街上不但热闹，而且到处都能听到音乐。我还不太习惯这么多人，不过心里还是很高兴。这种文化让我了解了中国人的生活。",
  },
  {
    id: "hsk3-health",
    title: "健康",
    level: "hsk3",
    text: "最近我总是觉得很累，所以去医院检查了一下。医生说我需要多锻炼，少吃甜的东西，还应该保证睡觉的时间。听完以后，我决定改变一些习惯。健康其实比成绩和钱更重要，自己必须认真对待。",
  },
  {
    id: "hsk3-library",
    title: "图书馆",
    level: "hsk3",
    text: "我喜欢去图书馆，因为那儿又安静又方便。我常常把生词本带去，先复习旧的，再学习新的。有一次我发现一本关于中国历史的书，看起来不容易，但是很有意思。明白一篇以后，我就越来越想继续读下去。",
  },
  {
    id: "hsk3-neighbour",
    title: "邻居",
    level: "hsk3",
    text: "我的邻居是一位很热情的老师。她不但经常帮助我练习汉语，而且还介绍我认识了几位新朋友。有时候我们在楼下面见面，站着聊一会儿天。通过这些简单的交流，我越来越习惯这里的生活了。",
  },
  {
    id: "hsk3-travel",
    title: "旅行",
    level: "hsk3",
    text: "去年夏天我去了一个南方的城市。那儿的天气又湿又热，但是水果特别新鲜。我们先坐了很长时间的火车，然后换公共汽车。虽然路上有点儿累，不过看到当地的文化和照片，还是觉得这次旅行很值得。",
  },

  // --- HSK 4 ---
  {
    id: "hsk4-method",
    title: "方法",
    level: "hsk4",
    text: "提高打字速度并没有秘密，关键在于方法。即使每天只有二十分钟，只要认真练习，也会慢慢看到结果。无论课文难还是容易，都应该先保证正确，再追求速度。因此，我给自己安排了一个简单的计划：先复习旧字，再输入新的段落。",
  },
  {
    id: "hsk4-experience",
    title: "经验",
    level: "hsk4",
    text: "刚开始工作的时候，我总是担心自己缺少经验。尽管同事们都支持我，我还是不敢主动发表意见。后来经理鼓励我参加讨论，我才发现，失败并不可怕，可怕的是不总结原因。通过几次实际的交流，我不但提高了能力，而且对自己更有信心了。",
  },
  {
    id: "hsk4-environment",
    title: "环境",
    level: "hsk4",
    text: "保护环境不仅仅是政府的责任，也和每个人的态度有关系。比如减少浪费、节约用水、选择公共交通，这些都是很普通却很有效的办法。如果大家都觉得自己的行为没有影响，问题就会越来越严重。只有共同努力，生活的质量才会真正得到改善。",
  },
  {
    id: "hsk4-choice",
    title: "决定",
    level: "hsk4",
    text: "人生中常常需要做选择。有的决定看起来很小，结果却会影响到后来的发展。我曾经为了方便，放弃了一个学习机会，后来觉得有些可惜。不过抱怨没有用，重要的是根据现在的条件重新安排。只要目标清楚，任何时候开始都不晚。",
  },
  {
    id: "hsk4-culture",
    title: "文化",
    level: "hsk4",
    text: "了解一种语言，其实就是在了解一种文化。不仅要记住词汇和语法，还应该注意人们说话的态度和习惯。有时候同样一句话，在不同的情况下意思并不完全一样。因此，多和当地人交流，比只在教室里做练习更有帮助。这样学到的知识也更容易留下来。",
  },
  {
    id: "hsk4-pressure",
    title: "压力",
    level: "hsk4",
    text: "现代社会的生活节奏很快，很多人长期处于紧张的状态。即使工作已经完成，也很难真正放松。我觉得，适当的压力可以让人进步，但是超过了一定程度，就会影响健康和心情。所以我们应该学会管理时间，留下一些属于自己的空间，而不是把所有精力都放在任务上。",
  },
  {
    id: "hsk4-online",
    title: "网络",
    level: "hsk4",
    text: "互联网改变了我们获得信息的方式。一方面，查找资料变得非常方便；另一方面，内容质量却很难保证。如果我们缺少判断能力，就容易被错误的消息影响。因此，阅读的时候应该比较不同的观点，而不是立刻接受某一个看法。独立思考，其实是一种很重要的习惯。",
  },
  {
    id: "hsk4-team",
    title: "合作",
    level: "hsk4",
    text: "一个成功的项目很少只靠一个人完成。它需要合作、沟通和互相尊重。尽管大家的性格不同，有的人活泼，有的人比较内向，但只要目标一致，就能够把各自的优点发挥出来。遇到矛盾的时候，不应该只批评别人，而应该一起分析情况，找出最合适的解决办法。",
  },
  {
    id: "hsk4-travel",
    title: "出差",
    level: "hsk4",
    text: "这次出差让我体会到计划的重要性。出发以前，我把会议的材料、交通和住宿都安排好了。即使中途出现了变化，我也能够比较冷静地处理。这次经验告诉我，充分的准备不但能减少紧张，还能给别人留下可靠的印象。以后无论去哪里，我都会提前做好调查。",
  },
  {
    id: "hsk4-reading",
    title: "阅读",
    level: "hsk4",
    text: "有的人觉得阅读浪费时间，我却不这么认为。一本好书往往能提供新的角度，帮助我们理解复杂的问题。当然，不是所有文章都值得花同样的精力。我们应该根据自己的目的来选择：有的只需了解大概，有的则需要仔细研究。这样，知识才会真正变成自己的东西。",
  },
  {
    id: "hsk4-honesty",
    title: "诚实",
    level: "hsk4",
    text: "在任何关系里，诚实都比表面的热情更重要。即使真话有时候会让人不舒服，长期来看却能增加信任。相反，为了暂时方便而隐瞒情况，最后往往会造成更大的误会。我认为，尊重别人首先要尊重事实。只有这样，交流才有基础，合作也才可能继续下去。",
  },
  {
    id: "hsk4-city-life",
    title: "城市生活",
    level: "hsk4",
    text: "大城市提供了丰富的机会，同时也带来拥挤、噪音和较高的生活成本。有人喜欢这种热闹，觉得发展空间更大；也有人更愿意选择安静的小城市，认为那里更适合生活。其实没有绝对正确的答案。关键是弄清楚自己重视什么：是事业的发展，还是日常的舒适和健康。",
  },
];

export function isLevel(value: string | null | undefined): value is Level {
  return value !== null && value !== undefined && (LEVELS as readonly string[]).includes(value);
}

export function passagesFor(level: Level): Passage[] {
  return PASSAGES.filter((passage) => passage.level === level);
}

export function randomPassage(level: Level): Passage {
  const pool = passagesFor(level);
  return pool[Math.floor(Math.random() * pool.length)] ?? PASSAGES[0];
}

export function randomPrompt(level: Level): string {
  return randomPassage(level).text.trim();
}

export function nextPassage(level: Level): string {
  return randomPrompt(level);
}

export function readLevelFromUrl(): Level {
  const params = new URLSearchParams(window.location.search);
  return isLevel(params.get("level")) ? params.get("level") as Level : "hsk1";
}

export function writeLevelToUrl(level: Level) {
  const url = new URL(window.location.href);
  url.searchParams.set("level", level);
  window.history.replaceState(null, "", url);
}
