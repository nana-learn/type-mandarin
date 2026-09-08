export type Category = "all" | "daily" | "hsk" | "story";

export type Passage = {
  id: string;
  title: string;
  category: Exclude<Category, "all">;
  text: string;
};

export const PASSAGES: Passage[] = [
  {
    id: "hsk-morning",
    title: "早上",
    category: "hsk",
    text: "今天早上天气很好。我七点起床，洗了脸，吃了早饭。早饭是面包和牛奶。然后我去学校上课。老师很高兴，同学也很友好。我们一起学习汉语，觉得很有意思。",
  },
  {
    id: "hsk-family",
    title: "家",
    category: "hsk",
    text: "我有一个幸福的家。家里有爸爸、妈妈和我。爸爸喜欢看书，妈妈喜欢做饭。星期天我们常去公园散步。我爱我的家，也爱我的爸爸妈妈。",
  },
  {
    id: "hsk-school",
    title: "学校",
    category: "hsk",
    text: "我在学校学习中文。每天要认很多汉字，还要练习写字。开始的时候我觉得很难，可是现在慢慢习惯了。只要每天多读、多写，就会越来越好。",
  },
  {
    id: "hsk-food",
    title: "吃饭",
    category: "hsk",
    text: "中午我去食堂吃饭。今天的菜是米饭、青菜和鸡蛋汤。味道不错，价格也便宜。吃完饭以后，我和朋友在树下聊天，休息一会儿再去教室。",
  },
  {
    id: "hsk-weekend",
    title: "周末",
    category: "hsk",
    text: "这个周末我想去书店买一本新书，再去咖啡馆坐一坐。如果下雨，我就待在家里看电影、听音乐。简单的计划也能让人感到开心。",
  },
  {
    id: "daily-commute",
    title: "出门",
    category: "daily",
    text: "早上出门的时候地铁很挤，车厢里安静得只能听见报站的声音。我站在门口，看着窗外一站一站地过去，心里把今天要做的事情又过了一遍。到站以后随着人流慢慢走出来，冷风一吹，人就清醒了。",
  },
  {
    id: "daily-rain",
    title: "下雨",
    category: "daily",
    text: "下午忽然下起了小雨。路边的伞一下子多了起来，路面反着浅浅的光。我走进一家小店躲雨，要了一杯热茶。雨打在玻璃上，世界好像慢了一拍，连说话都轻了些。",
  },
  {
    id: "daily-market",
    title: "菜市场",
    category: "daily",
    text: "周末去菜市场的时候，摊位上摆满了青菜、豆腐和刚出锅的包子。老板一边称重量，一边问要不要再送一把葱。我提着袋子往回走，太阳正好，连空气都有一点菜香。",
  },
  {
    id: "daily-work",
    title: "工作",
    category: "daily",
    text: "把一件事情做完，比把它想得很完美更重要。我先写下今天最要紧的三件事，然后一件一件去做。中间总会被消息打断，但只要及时回到桌上的那一行字，进度就不会丢。",
  },
  {
    id: "daily-night",
    title: "夜里",
    category: "daily",
    text: "夜里把灯关掉以后，窗外还有隐隐的车声。我把杯子洗干净，书签夹好，明天要穿的衣服也放在椅背上。这些很小的动作，会让早上少一点慌张。",
  },
  {
    id: "daily-friend",
    title: "朋友",
    category: "daily",
    text: "和老朋友吃饭的时候，话题总是从近况开始，再慢慢说到以前的事。有人换了工作，有人刚学会做饭，也有人还是老样子。散场后走在路上，我觉得被理解是一件很安静、也很珍贵的事。",
  },
  {
    id: "daily-tea",
    title: "喝茶",
    category: "daily",
    text: "我喜欢在下午泡一杯茶。水不要太烫，茶叶张开以后，香气才会慢慢出来。不必赶着喝完，看一会儿窗外的树，听一段不说话的时间，人也跟着松下来。",
  },
  {
    id: "story-library",
    title: "图书馆",
    category: "story",
    text: "她在图书馆最里面的座位坐下，把笔记本打开，却迟迟没有写下一个字。窗外的梧桐正在落叶，金色的光一片一片地掉在桌上。过了很久，她终于写下第一句：我想把今天记住。",
  },
  {
    id: "story-train",
    title: "火车",
    category: "story",
    text: "火车开动的时候，站台上有人在挥手。车厢里有人睡觉，有人吃橘子，有人盯着手机里的地图。原野从窗口不断后退，像一条不肯停下来的河。他想，出发其实很简单，难的是决定去哪里。",
  },
  {
    id: "story-old-street",
    title: "老街",
    category: "story",
    text: "那条老街并不宽，青石板被脚步磨得很亮。铺子里传出煎包的声音，门口坐着一位下棋的老人。我走得很慢，生怕走得太快，就把这些平常的风景错过了。",
  },
  {
    id: "story-letter",
    title: "信",
    category: "story",
    text: "他写了一封很长的信，又把它折起来，放进抽屉里。有些话适合寄出去，有些话只适合写给自己看。过了一个冬天，他再打开那封信，发现当时觉得很难的事情，如今已经轻了许多。",
  },
  {
    id: "story-mountain",
    title: "山上",
    category: "story",
    text: "他们沿着石阶往上走，雾气还没有散尽。山里很静，只能听见自己的呼吸和远处的鸟叫。到了山顶，云忽然裂开一条缝，城市像一块淡淡的影子出现在下面。谁也没有说话，风已经把该说的都说了。",
  },
  {
    id: "story-snow",
    title: "初雪",
    category: "story",
    text: "第一场雪来得很轻，落在屋顶上几乎没有声音。孩子们跑到院子里去看，大人站在门口笑。雪把夜晚照亮了一点，连平时看惯的路，也忽然变得新了。",
  },
  {
    id: "daily-study",
    title: "学习",
    category: "daily",
    text: "学语言最怕三天打鱼两天晒网。每天哪怕只练习二十分钟，把当天的字再打一遍，比周末突击两个小时更有用。速度是练出来的，准确也是。先求对，再求快，手就会自己记住。",
  },
  {
    id: "hsk-weather",
    title: "天气",
    category: "hsk",
    text: "今天比昨天冷一点，所以我穿了外套。天气预报说下午可能下雨，出门最好带伞。如果明天放晴，我们就去河边走走，拍一些照片，再找一家小店喝汤。",
  },
];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function passagesFor(category: Category): Passage[] {
  if (category === "all") return PASSAGES;
  return PASSAGES.filter((passage) => passage.category === category);
}

export function buildPrompt(category: Category, minChars = 800): string {
  const pool = passagesFor(category);
  const shuffled = shuffle(pool.length ? pool : PASSAGES);
  const parts: string[] = [];
  let length = 0;
  let index = 0;
  while (length < minChars) {
    const text = shuffled[index % shuffled.length].text.trim();
    parts.push(text);
    length += text.length;
    index += 1;
  }
  return parts.join("");
}

export function nextPassage(category: Category): string {
  const pool = passagesFor(category);
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? PASSAGES[0];
  return pick.text.trim();
}
