// Archival pictures of the field's own history, one per layer of the stack, found in open collections
// with tasteskill's assets.mjs and kept in public/archive/ (see public/archive/CREDITS.md).
// None of them shows a course; they show the world each layer comes from.
import type { Category } from './taxonomy';

export interface Picture {
  file: string;
  width: number;
  height: number;
  alt: string;
  /** Where the subject sits in the frame, for object-position. */
  focus: string;
  title: string;
  page: string;
  byline: string;
}

export const pictures: Record<Category, Picture> = {
  apps: {
    file: 'archive/apps.jpg',
    width: 1600,
    height: 1020,
    alt: '1957 年 NASA 兰利研究中心的 IBM 704 计算机机房，几位工作人员坐在桌前处理资料',
    focus: '50% 55%',
    title: 'IBM 704 Computer Operations, 1957',
    page: 'https://commons.wikimedia.org/wiki/File:IBM_704_Computer_Operations_(LRC-1957-B701_P-05391).tiff',
    byline: '（NASA Langley Research Center，公有领域）',
  },
  agents: {
    file: 'archive/agents.jpg',
    width: 1600,
    height: 2133,
    alt: '陈列在计算机历史博物馆里的 Shakey 机器人：轮式底座上叠着电子箱、摄像头和测距仪',
    focus: '45% 45%',
    title: 'Shakey the Robot, Computer History Museum',
    page: 'https://commons.wikimedia.org/wiki/File:Shakey_the_Robot_(developed_between_1966-1972_at_SRI_International)_-_Computer_History_Museum_(2007-11-10_23.16.01_by_Carlo_Nardone).jpg',
    byline: '（Carlo Nardone，CC BY-SA 2.0）',
  },
  llm: {
    file: 'archive/llm.jpg',
    width: 1200,
    height: 538,
    alt: '一张 1895 年的 Hollerith 穿孔卡片，数字和字母按列排开，部分格子打了孔',
    focus: '40% 50%',
    title: 'Hollerith Punched Card, 1895',
    page: 'https://commons.wikimedia.org/wiki/File:Hollerith_Punched_Card.jpg',
    byline: '（公有领域）',
  },
  foundations: {
    file: 'archive/foundations.jpg',
    width: 1166,
    height: 945,
    alt: '1960 年 Mark I 感知机操作手册中的插图：机柜、摄像头和接线板，旁边标着各部件名称',
    focus: '45% 50%',
    title: 'Mark I Perceptron, operator’s manual, 1960',
    page: 'https://commons.wikimedia.org/wiki/File:Mark_I_Perceptron,_Figure_2_of_operator%27s_manual.png',
    byline: '（John C. Hay、Albert E. Murray，公有领域）',
  },
  infra: {
    file: 'archive/infra.jpg',
    width: 1340,
    height: 1024,
    alt: '约 1947 年，Glen Beck 和 Betty Snyder 在弹道研究实验室为 ENIAC 编程，身后是一排排机柜',
    focus: '60% 45%',
    title: 'Glen Beck and Betty Snyder program the ENIAC',
    page: 'https://commons.wikimedia.org/wiki/File:Glen_Beck_and_Betty_Snyder_program_the_ENIAC_in_building_328_at_the_Ballistic_Research_Laboratory.jpg',
    byline: '（美国陆军，公有领域）',
  },
};

export const credits = Object.values(pictures).filter((p) => p.page);
