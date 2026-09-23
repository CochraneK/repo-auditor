// 模拟题库数据 - 自动生成
var MOCK_SCENARIOS = [
  {
    "id": "bully_1",
    "stage": "小学",
    "theme": "bullying",
    "title": "课间的孤立",
    "description": "课间，几个同学围在一起聊天。你走过去想加入，他们突然不说话了，其中一个小声说：走吧，别理她。你站在原地，不知道自己做错了什么。",
    "options": [
      {
        "id": "b1_a",
        "text": "追上去问自己是不是得罪他们了",
        "effects": {
          "self_selfWorth": -15,
          "self_safety": -8,
          "self_trust": -10,
          "self_resilience": -5,
          "self_trauma": 20,
          "father_selfWorth": -5,
          "mother_selfWorth": -8,
          "friend_selfWorth": 0,
          "teacher_selfWorth": -3,
          "bystander_selfWorth": 0,
          "bully_selfWorth": 5,
          "bully_safety": 8,
          "bully_trauma": -5
        }
      },
      {
        "id": "b1_b",
        "text": "假装没事，去找其他同学玩",
        "effects": {
          "self_selfWorth": -5,
          "self_safety": 0,
          "self_trust": -8,
          "self_resilience": 5,
          "self_trauma": 10,
          "mother_selfWorth": -3,
          "friend_selfWorth": 5,
          "teacher_selfWorth": 0,
          "bystander_selfWorth": 2,
          "bully_selfWorth": 0
        }
      },
      {
        "id": "b1_c",
        "text": "告诉老师这件事",
        "effects": {
          "self_selfWorth": 8,
          "self_safety": -15,
          "self_trust": -12,
          "self_resilience": -3,
          "self_trauma": 8,
          "father_selfWorth": 5,
          "mother_selfWorth": 10,
          "friend_selfWorth": -3,
          "teacher_selfWorth": 15,
          "teacher_trust": -8,
          "bystander_selfWorth": 3,
          "bully_selfWorth": -10,
          "bully_safety": -15,
          "bully_trauma": 10
        }
      },
      {
        "id": "b1_d",
        "text": "默默回到座位，一个人待着",
        "effects": {
          "self_selfWorth": -20,
          "self_safety": -10,
          "self_trust": -15,
          "self_resilience": -10,
          "self_trauma": 25,
          "father_selfWorth": -5,
          "mother_selfWorth": -10,
          "friend_selfWorth": -5,
          "teacher_selfWorth": 0,
          "bystander_selfWorth": 0,
          "bully_selfWorth": 8,
          "bully_safety": 10,
          "bully_trauma": -8
        }
      }
    ]
  },
  {
    "id": "bully_2",
    "stage": "小学",
    "theme": "bullying",
    "title": "储物柜上的涂鸦",
    "description": "你打开储物柜，发现里面被人写了「全班最丑」几个大字。周围几个同学捂着嘴笑，你感觉血液都凝固了。",
    "options": [
      {
        "id": "b2_a",
        "text": "用书包遮住，假装什么都没看见",
        "effects": {
          "self_selfWorth": -18,
          "self_safety": -12,
          "self_resilience": -8,
          "self_trauma": 22,
          "mother_selfWorth": -8,
          "friend_selfWorth": 0,
          "teacher_selfWorth": 0,
          "bystander_selfWorth": 2,
          "bully_selfWorth": 10,
          "bully_safety": 12,
          "bully_trauma": -10
        }
      },
      {
        "id": "b2_b",
        "text": "擦掉，然后告诉班主任",
        "effects": {
          "self_selfWorth": 5,
          "self_safety": -8,
          "self_resilience": 5,
          "self_trauma": 12,
          "mother_selfWorth": 5,
          "friend_selfWorth": 3,
          "teacher_selfWorth": 12,
          "bystander_selfWorth": 5,
          "bully_selfWorth": -8,
          "bully_safety": -12,
          "bully_trauma": 8
        }
      },
      {
        "id": "b2_c",
        "text": "哭着跑出教室",
        "effects": {
          "self_selfWorth": -10,
          "self_safety": -18,
          "self_resilience": -15,
          "self_trauma": 18,
          "father_selfWorth": -8,
          "mother_selfWorth": -15,
          "friend_selfWorth": 8,
          "teacher_selfWorth": 3,
          "bystander_selfWorth": 3,
          "bully_selfWorth": 15,
          "bully_safety": 15,
          "bully_trauma": -15
        }
      },
      {
        "id": "b2_d",
        "text": "大声说：我知道是谁干的",
        "effects": {
          "self_selfWorth": 12,
          "self_safety": -10,
          "self_resilience": 8,
          "self_trauma": 15,
          "mother_selfWorth": 8,
          "friend_selfWorth": 5,
          "teacher_selfWorth": 5,
          "bystander_selfWorth": 8,
          "bully_selfWorth": -12,
          "bully_safety": -15,
          "bully_trauma": 12
        }
      }
    ]
  },
  {
    "id": "bully_3",
    "stage": "初中",
    "theme": "bullying",
    "title": "社交媒体上的照片",
    "description": "有人在网上发了一张你换衣服时被偷拍的照片，附上侮辱性的文字。你的手机被打爆了，全是嘲笑和恶意。",
    "options": [
      {
        "id": "b3_a",
        "text": "关掉手机，不敢看",
        "effects": {
          "self_selfWorth": -25,
          "self_safety": -20,
          "self_trust": -20,
          "self_resilience": -15,
          "self_trauma": 35,
          "father_selfWorth": -10,
          "mother_selfWorth": -20,
          "friend_selfWorth": -5,
          "teacher_selfWorth": -5,
          "bystander_selfWorth": 0,
          "bully_selfWorth": 20,
          "bully_safety": 20,
          "bully_trauma": -20
        }
      },
      {
        "id": "b3_b",
        "text": "截图保存证据，告诉父母并报警",
        "effects": {
          "self_selfWorth": 15,
          "self_safety": -10,
          "self_resilience": 12,
          "self_trauma": 20,
          "father_selfWorth": 10,
          "mother_selfWorth": 15,
          "friend_selfWorth": 8,
          "teacher_selfWorth": 8,
          "bystander_selfWorth": 5,
          "bully_selfWorth": -20,
          "bully_safety": -25,
          "bully_trauma": 25
        }
      },
      {
        "id": "b3_c",
        "text": "发一条朋友圈反击",
        "effects": {
          "self_selfWorth": 5,
          "self_safety": -15,
          "self_resilience": 5,
          "self_trauma": 25,
          "mother_selfWorth": -10,
          "friend_selfWorth": 3,
          "teacher_selfWorth": 0,
          "bystander_selfWorth": 5,
          "bully_selfWorth": -15,
          "bully_safety": -18,
          "bully_trauma": 18
        }
      },
      {
        "id": "b3_d",
        "text": "不上学了，让父母帮忙转学",
        "effects": {
          "self_selfWorth": -15,
          "self_safety": 5,
          "self_resilience": -20,
          "self_trauma": 15,
          "father_selfWorth": -5,
          "mother_selfWorth": -8,
          "friend_selfWorth": -10,
          "teacher_selfWorth": 0,
          "bystander_selfWorth": -5,
          "bully_selfWorth": 10,
          "bully_safety": 10,
          "bully_trauma": -5
        }
      }
    ]
  },
  {
    "id": "depress_1",
    "stage": "童年",
    "theme": "depression",
    "title": "生日会的缺席",
    "description": "你生日那天，妈妈说好了要办一个生日会。但到了那天，她说工作太忙取消了。你一个人坐在房间里，看着准备好的气球和装饰品。",
    "options": [
      {
        "id": "dp1_a",
        "text": "大发脾气，摔东西",
        "effects": {
          "self_selfValue": 5,
          "self_connection": -10,
          "self_emotionReg": -15,
          "self_dailyFunc": -5,
          "self_distress": 15,
          "father_selfValue": -10,
          "mother_selfValue": -15,
          "sibling_selfValue": -8,
          "friendSame_selfValue": -5,
          "teacher_selfValue": 0,
          "relative_selfValue": -3
        }
      },
      {
        "id": "dp1_b",
        "text": "什么都不说，默默承受",
        "effects": {
          "self_selfValue": -15,
          "self_connection": -15,
          "self_emotionReg": -20,
          "self_dailyFunc": -10,
          "self_distress": 25,
          "mother_selfValue": 5,
          "sibling_selfValue": -5,
          "friendSame_selfValue": -3,
          "teacher_selfValue": 0,
          "relative_selfValue": 0
        }
      },
      {
        "id": "dp1_c",
        "text": "写日记记录下自己的感受",
        "effects": {
          "self_selfValue": 10,
          "self_emotionReg": 12,
          "self_dailyFunc": 5,
          "self_distress": -10,
          "mother_selfValue": 3,
          "sibling_selfValue": 0,
          "friendSame_selfValue": 5,
          "teacher_selfValue": 5,
          "relative_selfValue": 0
        }
      },
      {
        "id": "dp1_d",
        "text": "偷偷在被子里哭，觉得是自己不够好",
        "effects": {
          "self_selfValue": -25,
          "self_emotionReg": -25,
          "self_dailyFunc": -15,
          "self_distress": 30,
          "mother_selfValue": -8,
          "sibling_selfValue": -3,
          "friendSame_selfValue": -5,
          "teacher_selfValue": 0,
          "relative_selfValue": 0
        }
      }
    ]
  },
  {
    "id": "depress_2",
    "stage": "青年",
    "theme": "depression",
    "title": "朋友的疏远",
    "description": "你发现自己越来越不想出门，不想回复朋友的消息。每次朋友约你，你说「下次吧」，已经说了十几次了。朋友们的消息越来越少。",
    "options": [
      {
        "id": "dp2_a",
        "text": "强撑着去参加聚会，假装很开心",
        "effects": {
          "self_selfValue": -10,
          "self_connection": 8,
          "self_emotionReg": -20,
          "self_dailyFunc": -15,
          "self_distress": 20,
          "father_selfValue": 5,
          "mother_selfValue": 5,
          "friendSame_selfValue": 12,
          "friendSame_connection": 15,
          "teacher_selfValue": 0,
          "relative_selfValue": 0
        }
      },
      {
        "id": "dp2_b",
        "text": "坦白告诉朋友，自己最近状态不好",
        "effects": {
          "self_selfValue": 15,
          "self_connection": 10,
          "self_emotionReg": 8,
          "self_distress": -15,
          "father_selfValue": 3,
          "mother_selfValue": 8,
          "friendSame_selfValue": 15,
          "friendSame_connection": 20,
          "teacher_selfValue": 5,
          "relative_selfValue": 3
        }
      },
      {
        "id": "dp2_c",
        "text": "继续回避，断掉所有社交联系",
        "effects": {
          "self_selfValue": -20,
          "self_connection": -25,
          "self_emotionReg": -15,
          "self_dailyFunc": -10,
          "self_distress": 25,
          "father_selfValue": -10,
          "mother_selfValue": -15,
          "friendSame_selfValue": -20,
          "friendSame_connection": -25,
          "teacher_selfValue": -5,
          "relative_selfValue": -5
        }
      },
      {
        "id": "dp2_d",
        "text": "去医院挂号，看心理科",
        "effects": {
          "self_selfValue": 8,
          "self_connection": 5,
          "self_emotionReg": 15,
          "self_dailyFunc": 10,
          "self_distress": -20,
          "father_selfValue": -10,
          "mother_selfValue": 5,
          "friendSame_selfValue": 10,
          "teacher_selfValue": 3,
          "relative_selfValue": -5
        }
      }
    ]
  },
  {
    "id": "depress_3",
    "stage": "中年",
    "theme": "depression",
    "title": "清晨的床",
    "description": "闹钟响了，但你感觉身体像灌了铅一样沉重。窗外阳光很好，你知道自己应该起床，但被子好像有吸力，把你牢牢按在床上。上班已经迟到了。",
    "options": [
      {
        "id": "dp3_a",
        "text": "强迫自己起床，哪怕只撑到公司",
        "effects": {
          "self_selfValue": 8,
          "self_emotionReg": -10,
          "self_dailyFunc": 15,
          "self_distress": 10,
          "father_selfValue": 5,
          "mother_selfValue": 5,
          "friendSame_selfValue": 3,
          "teacher_selfValue": 0,
          "relative_selfValue": 3
        }
      },
      {
        "id": "dp3_b",
        "text": "给公司打电话请假，继续躺着",
        "effects": {
          "self_selfValue": -12,
          "self_emotionReg": 5,
          "self_dailyFunc": -15,
          "self_distress": 15,
          "father_selfValue": -15,
          "mother_selfValue": -10,
          "friendSame_selfValue": -5,
          "teacher_selfValue": 0,
          "relative_selfValue": -5
        }
      },
      {
        "id": "dp3_c",
        "text": "打电话给心理咨询师，约一次谈话",
        "effects": {
          "self_selfValue": 15,
          "self_emotionReg": 18,
          "self_dailyFunc": 8,
          "self_distress": -20,
          "father_selfValue": 0,
          "mother_selfValue": 8,
          "friendSame_selfValue": 8,
          "teacher_selfValue": 0,
          "relative_selfValue": 3
        }
      },
      {
        "id": "dp3_d",
        "text": "假装生病，让家人帮忙请假",
        "effects": {
          "self_selfValue": -18,
          "self_emotionReg": -5,
          "self_dailyFunc": -20,
          "self_distress": 20,
          "father_selfValue": -12,
          "mother_selfValue": -8,
          "friendSame_selfValue": -8,
          "teacher_selfValue": 0,
          "relative_selfValue": -8
        }
      }
    ]
  },
  {
    "id": "schizo_1",
    "stage": "童年",
    "theme": "schizophrenia",
    "title": "脑海中的声音",
    "description": "你发现自己经常听到一些声音，有时候是批评你的，有时候在告诉你该做什么。你不确定这是不是真的，因为其他人似乎都听不见。",
    "options": [
      {
        "id": "sc1_a",
        "text": "告诉父母，感觉有人在跟你说话",
        "effects": {
          "self_reality": 10,
          "self_identity": 8,
          "self_function": 5,
          "self_insight": 15,
          "self_crisis": -10,
          "father_reality": -8,
          "mother_reality": -15,
          "sibling_reality": -5,
          "psychiatrist_reality": 15,
          "psychiatrist_insight": 20,
          "neighbor_reality": -5
        }
      },
      {
        "id": "sc1_b",
        "text": "忽略那些声音，告诉自己这是想象",
        "effects": {
          "self_reality": -15,
          "self_identity": -10,
          "self_function": -8,
          "self_insight": -15,
          "self_crisis": 20,
          "mother_reality": -5,
          "psychiatrist_insight": 0,
          "neighbor_reality": -3
        }
      },
      {
        "id": "sc1_c",
        "text": "上网搜索这是什么情况",
        "effects": {
          "self_reality": 5,
          "self_insight": 12,
          "self_function": 3,
          "self_crisis": -5,
          "psychiatrist_insight": 8,
          "neighbor_reality": 0
        }
      },
      {
        "id": "sc1_d",
        "text": "按照声音的指示行动",
        "effects": {
          "self_reality": -25,
          "self_identity": -20,
          "self_function": -20,
          "self_insight": -25,
          "self_crisis": 35,
          "father_reality": -15,
          "mother_reality": -20,
          "sibling_reality": -10,
          "psychiatrist_reality": -10,
          "neighbor_reality": -10
        }
      }
    ]
  },
  {
    "id": "schizo_2",
    "stage": "青年",
    "theme": "schizophrenia",
    "title": "药物的副作用",
    "description": "医生给你开了药，但副作用让你很痛苦——手抖、嗜睡、反应变慢。你感觉吃药之后更不像自己了。停药的冲动很强。",
    "options": [
      {
        "id": "sc2_a",
        "text": "坚持服药，记录副作用并定期复诊",
        "effects": {
          "self_reality": 15,
          "self_identity": 8,
          "self_function": 12,
          "self_insight": 18,
          "self_crisis": -15,
          "father_reality": 5,
          "mother_reality": 8,
          "psychiatrist_insight": 15,
          "nurse_reality": 10
        }
      },
      {
        "id": "sc2_b",
        "text": "自己减药，感觉好一些再说",
        "effects": {
          "self_reality": -15,
          "self_identity": -8,
          "self_function": -10,
          "self_insight": -5,
          "self_crisis": 20,
          "mother_reality": -10,
          "psychiatrist_insight": -10,
          "nurse_reality": -8
        }
      },
      {
        "id": "sc2_c",
        "text": "完全停药，靠意志力扛过去",
        "effects": {
          "self_reality": -25,
          "self_identity": -18,
          "self_function": -20,
          "self_insight": -15,
          "self_crisis": 35,
          "father_reality": -12,
          "mother_reality": -15,
          "psychiatrist_insight": -15,
          "nurse_reality": -12
        }
      },
      {
        "id": "sc2_d",
        "text": "找医生商量换一种药",
        "effects": {
          "self_reality": 12,
          "self_identity": 10,
          "self_function": 8,
          "self_insight": 15,
          "self_crisis": -10,
          "mother_reality": 5,
          "psychiatrist_insight": 12,
          "nurse_reality": 8
        }
      }
    ]
  },
  {
    "id": "schizo_3",
    "stage": "中年",
    "theme": "schizophrenia",
    "title": "复发的前兆",
    "description": "你感觉最近睡眠越来越差，脑海中的声音又开始变多，周围人看你的眼神似乎也不太对。你知道这可能是复发的前兆。",
    "options": [
      {
        "id": "sc3_a",
        "text": "立刻联系主治医生，加一次复诊",
        "effects": {
          "self_reality": 15,
          "self_identity": 12,
          "self_insight": 20,
          "self_crisis": -20,
          "father_reality": 8,
          "mother_reality": 8,
          "psychiatrist_insight": 15,
          "nurse_insight": 10
        }
      },
      {
        "id": "sc3_b",
        "text": "自己加大药量",
        "effects": {
          "self_reality": -10,
          "self_function": -15,
          "self_insight": -5,
          "self_crisis": 5,
          "mother_reality": -8,
          "psychiatrist_insight": -10,
          "nurse_insight": -8
        }
      },
      {
        "id": "sc3_c",
        "text": "假装没事，希望只是最近太累了",
        "effects": {
          "self_reality": -20,
          "self_identity": -15,
          "self_insight": -18,
          "self_crisis": 25,
          "father_reality": -10,
          "mother_reality": -12,
          "psychiatrist_insight": -15,
          "nurse_insight": -12
        }
      },
      {
        "id": "sc3_d",
        "text": "告诉家人，让他们帮忙留意",
        "effects": {
          "self_reality": 10,
          "self_identity": 8,
          "self_insight": 15,
          "self_crisis": -15,
          "father_reality": 10,
          "mother_reality": 12,
          "psychiatrist_insight": 10,
          "nurse_insight": 8
        }
      }
    ]
  },
  {
    "id": "anx_1",
    "stage": "青年",
    "theme": "anxiety",
    "title": "航班前的恐慌",
    "description": "明天有一场重要的工作面试，你需要坐飞机去另一个城市。今晚你开始担心：飞机会不会出事？会不会在面试时突然恐慌发作？心跳越来越快，手开始发抖。",
    "options": [
      {
        "id": "a1_a",
        "text": "深呼吸，尝试用放松技巧",
        "effects": {
          "self_calm": 10,
          "self_control": 15,
          "self_panic": -15,
          "father_calm": 3,
          "mother_calm": 5,
          "therapist_calm": 8,
          "friend_calm": 5,
          "colleague_calm": 0,
          "doctor_calm": 5
        }
      },
      {
        "id": "a1_b",
        "text": "取消面试，改坐火车",
        "effects": {
          "self_calm": 15,
          "self_control": -15,
          "self_function": -20,
          "self_panic": -10,
          "father_control": -10,
          "mother_calm": 5,
          "therapist_control": -10,
          "friend_calm": -5,
          "colleague_function": -15,
          "doctor_calm": 3
        }
      },
      {
        "id": "a1_c",
        "text": "吃一颗安眠药强迫自己睡觉",
        "effects": {
          "self_calm": 5,
          "self_control": -10,
          "self_function": -15,
          "self_panic": 5,
          "father_calm": -5,
          "mother_calm": -8,
          "therapist_control": -15,
          "friend_calm": -5,
          "doctor_calm": -10
        }
      },
      {
        "id": "a1_d",
        "text": "打电话给心理咨询师求助",
        "effects": {
          "self_calm": 18,
          "self_control": 20,
          "self_panic": -25,
          "father_calm": 5,
          "mother_calm": 10,
          "therapist_calm": 20,
          "friend_calm": 12,
          "colleague_calm": 5,
          "doctor_calm": 15
        }
      }
    ]
  },
  {
    "id": "anx_2",
    "stage": "职场",
    "theme": "anxiety",
    "title": "会议室的发作",
    "description": "正在开重要会议，你突然感觉心跳加速、呼吸困难、手脚发麻。你很确定自己要晕倒了。所有人都在看着投影，听着汇报。",
    "options": [
      {
        "id": "a2_a",
        "text": "举手说需要出去一下，尽快离开会议室",
        "effects": {
          "self_calm": 12,
          "self_control": 15,
          "self_social": -10,
          "self_panic": -15,
          "father_social": -3,
          "mother_social": -5,
          "therapist_control": 15,
          "friend_social": 5,
          "colleague_social": -8,
          "doctor_calm": 10
        }
      },
      {
        "id": "a2_b",
        "text": "强撑着继续假装没事",
        "effects": {
          "self_calm": -15,
          "self_control": -10,
          "self_social": 5,
          "self_panic": 25,
          "father_control": -5,
          "mother_calm": -5,
          "therapist_control": -10,
          "friend_social": 0,
          "colleague_social": 3,
          "doctor_calm": -8
        }
      },
      {
        "id": "a2_c",
        "text": "低头假装做笔记，等症状自然过去",
        "effects": {
          "self_calm": -5,
          "self_control": 5,
          "self_social": -3,
          "self_panic": 15,
          "father_control": 0,
          "mother_calm": -3,
          "therapist_control": 5,
          "friend_social": 0,
          "colleague_social": 0,
          "doctor_calm": -3
        }
      },
      {
        "id": "a2_d",
        "text": "偷偷发微信给同事，请他帮你圆场",
        "effects": {
          "self_calm": 8,
          "self_control": 8,
          "self_social": -5,
          "self_panic": -8,
          "father_control": 0,
          "mother_calm": -3,
          "therapist_control": 8,
          "friend_social": 8,
          "colleague_social": -5,
          "doctor_calm": 5
        }
      }
    ]
  },
  {
    "id": "anx_3",
    "stage": "中年",
    "theme": "anxiety",
    "title": "孩子的安全焦虑",
    "description": "孩子放学晚了半小时还没到家。你的脑海里开始涌现各种可怕场景：出车祸了？被人拐走了？每过一分钟你就更焦虑，打了三个电话都没人接。",
    "options": [
      {
        "id": "a3_a",
        "text": "立刻开车去找孩子",
        "effects": {
          "self_calm": 10,
          "self_control": -15,
          "self_social": -8,
          "self_panic": 5,
          "father_calm": -10,
          "mother_calm": 8,
          "therapist_control": -8,
          "friend_calm": -3,
          "partner_calm": 5,
          "doctor_calm": 0
        }
      },
      {
        "id": "a3_b",
        "text": "打电话给学校确认情况",
        "effects": {
          "self_calm": 15,
          "self_control": 15,
          "self_panic": -10,
          "father_calm": 8,
          "mother_calm": 15,
          "therapist_control": 10,
          "friend_calm": 5,
          "partner_calm": 12,
          "doctor_calm": 8
        }
      },
      {
        "id": "a3_c",
        "text": "在群里问其他家长",
        "effects": {
          "self_calm": 8,
          "self_control": 10,
          "self_social": 5,
          "self_panic": -5,
          "father_calm": 5,
          "mother_calm": 8,
          "therapist_control": 5,
          "friend_social": 8,
          "partner_calm": 8,
          "doctor_calm": 3
        }
      },
      {
        "id": "a3_d",
        "text": "躺在床上等待，强迫自己不要往坏处想",
        "effects": {
          "self_calm": -20,
          "self_control": -25,
          "self_panic": 30,
          "father_calm": -15,
          "mother_calm": -15,
          "therapist_control": -15,
          "friend_calm": -8,
          "partner_calm": -10,
          "doctor_calm": -10
        }
      }
    ]
  },
  {
    "id": "ptsd_1",
    "stage": "恢复期",
    "theme": "ptsd",
    "title": "汽车的回响",
    "description": "事故已经过去三个月了。今天过马路时，有辆车按了喇叭。你立刻僵住了——心跳狂跳，呼吸急促，仿佛那场事故就在眼前发生。",
    "options": [
      {
        "id": "p1_a",
        "text": "蹲下抱住自己，用 grounding 技巧让自己回到现实",
        "effects": {
          "self_safety": 15,
          "self_trust": 8,
          "self_identity": 10,
          "self_connection": 5,
          "self_trigger": -15,
          "father_safety": 3,
          "mother_safety": 5,
          "therapist_safety": 15,
          "friend_safety": 8,
          "doctor_safety": 5
        }
      },
      {
        "id": "p1_b",
        "text": "赶紧跑开，躲进附近的商店",
        "effects": {
          "self_safety": 5,
          "self_trust": -5,
          "self_identity": -8,
          "self_connection": -10,
          "self_trigger": 10,
          "father_safety": -5,
          "mother_safety": -8,
          "therapist_safety": -10,
          "friend_safety": -5,
          "doctor_safety": -3
        }
      },
      {
        "id": "p1_c",
        "text": "强迫自己站在原地，告诉自己这不是真的",
        "effects": {
          "self_safety": -10,
          "self_trust": -5,
          "self_identity": 5,
          "self_connection": -5,
          "self_trigger": 15,
          "father_identity": -3,
          "mother_safety": -5,
          "therapist_identity": 10,
          "friend_safety": -3,
          "doctor_safety": -5
        }
      },
      {
        "id": "p1_d",
        "text": "深呼吸后打车回家，今天不再出门",
        "effects": {
          "self_safety": 8,
          "self_trust": -10,
          "self_identity": -12,
          "self_connection": -8,
          "self_trigger": 5,
          "father_safety": -8,
          "mother_safety": -5,
          "therapist_safety": 5,
          "friend_connection": -5,
          "doctor_safety": 0
        }
      }
    ]
  },
  {
    "id": "ptsd_2",
    "stage": "重建期",
    "theme": "ptsd",
    "title": "亲密关系的重建",
    "description": "创伤之后，你对亲密接触变得非常敏感。伴侣想拥抱你，你本能地想要推开。你知道这不是他的错，但身体的反应不受控制。",
    "options": [
      {
        "id": "p2_a",
        "text": "坦诚告诉伴侣自己的感受和界限",
        "effects": {
          "self_safety": 15,
          "self_trust": 18,
          "self_identity": 15,
          "self_connection": 10,
          "self_trigger": -10,
          "father_trust": 5,
          "mother_trust": 8,
          "therapist_trust": 20,
          "friend_connection": 10,
          "partner_trust": 15,
          "doctor_trust": 8
        }
      },
      {
        "id": "p2_b",
        "text": "强迫自己接受拥抱，假装一切正常",
        "effects": {
          "self_safety": -20,
          "self_trust": -15,
          "self_identity": -10,
          "self_connection": -8,
          "self_trigger": 25,
          "father_trust": -5,
          "mother_trust": -8,
          "therapist_identity": -15,
          "friend_connection": -10,
          "partner_trust": -15,
          "doctor_trust": -8
        }
      },
      {
        "id": "p2_c",
        "text": "回避亲密接触，避免触发",
        "effects": {
          "self_safety": 5,
          "self_trust": -20,
          "self_identity": -15,
          "self_connection": -25,
          "self_trigger": -5,
          "father_trust": -15,
          "mother_trust": -10,
          "therapist_connection": -15,
          "friend_connection": -15,
          "partner_trust": -20,
          "doctor_trust": -10
        }
      },
      {
        "id": "p2_d",
        "text": "和伴侣一起去做创伤伴侣咨询",
        "effects": {
          "self_safety": 20,
          "self_trust": 20,
          "self_identity": 12,
          "self_connection": 18,
          "self_trigger": -18,
          "father_trust": 10,
          "mother_trust": 10,
          "therapist_trust": 18,
          "friend_connection": 12,
          "partner_trust": 20,
          "doctor_trust": 12
        }
      }
    ]
  },
  {
    "id": "ptsd_3",
    "stage": "整合期",
    "theme": "ptsd",
    "title": "周年纪念的反应",
    "description": "今天是事件发生的一周年。你知道这天会很难熬，但没想到反应会这么强烈。你把自己关在房间里，无法去上班。",
    "options": [
      {
        "id": "p3_a",
        "text": "联系治疗师，加一次紧急咨询",
        "effects": {
          "self_safety": 18,
          "self_identity": 15,
          "self_connection": 10,
          "self_trigger": -20,
          "father_identity": 5,
          "mother_identity": 8,
          "therapist_identity": 20,
          "friend_connection": 10,
          "doctor_safety": 12
        }
      },
      {
        "id": "p3_b",
        "text": "给创伤事件中的自己写一封信",
        "effects": {
          "self_identity": 20,
          "self_connection": 10,
          "self_trigger": -15,
          "father_identity": 8,
          "mother_identity": 8,
          "therapist_identity": 18,
          "friend_connection": 8,
          "doctor_identity": 10
        }
      },
      {
        "id": "p3_c",
        "text": "强迫自己去上班，不让创伤影响生活",
        "effects": {
          "self_safety": -15,
          "self_identity": -12,
          "self_connection": -5,
          "self_trigger": 20,
          "father_identity": -8,
          "mother_identity": -10,
          "therapist_identity": -15,
          "friend_connection": -8,
          "doctor_safety": -10
        }
      },
      {
        "id": "p3_d",
        "text": "喝酒麻痹自己",
        "effects": {
          "self_safety": -25,
          "self_identity": -20,
          "self_connection": -25,
          "self_trigger": 30,
          "father_identity": -15,
          "mother_identity": -15,
          "therapist_identity": -20,
          "friend_connection": -20,
          "doctor_identity": -15
        }
      }
    ]
  },
  {
    "id": "woman_1",
    "stage": "少年",
    "theme": "general",
    "title": "升学宴上的话题",
    "description": "亲戚家的升学宴上，大人们聊起孩子的成绩。七大姑八大姨问了一圈后，把目光转向你：女孩子读那么多书干嘛？不如早点嫁人。全桌人都笑了，等着看你的反应。",
    "options": [
      {
        "id": "w1_a",
        "text": "笑着说：我还想读研读博呢",
        "effects": {
          "self_selfEsteem": 15,
          "self_social": -10,
          "self_sensitivity": 5,
          "self_compliance": -15,
          "self_stress": 15,
          "father_selfEsteem": -15,
          "mother_selfEsteem": -5,
          "sibling_selfEsteem": -3,
          "friendSame_selfEsteem": 15,
          "friendOpposite_selfEsteem": 8,
          "teacher_selfEsteem": 12,
          "relative_selfEsteem": -12,
          "relative_compliance": 10
        }
      },
      {
        "id": "w1_b",
        "text": "低头不说话，假装没听见",
        "effects": {
          "self_selfEsteem": -15,
          "self_social": -5,
          "self_sensitivity": -8,
          "self_compliance": 15,
          "self_stress": 20,
          "father_selfEsteem": 5,
          "mother_selfEsteem": -8,
          "sibling_selfEsteem": -5,
          "friendSame_selfEsteem": -8,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": 5
        }
      },
      {
        "id": "w1_c",
        "text": "问亲戚：您家孩子读的什么专业？",
        "effects": {
          "self_selfEsteem": 12,
          "self_social": 5,
          "self_sensitivity": 3,
          "self_compliance": -10,
          "self_stress": 8,
          "father_selfEsteem": 0,
          "mother_selfEsteem": 8,
          "sibling_selfEsteem": 5,
          "friendSame_selfEsteem": 10,
          "teacher_selfEsteem": 8,
          "relative_selfEsteem": -8
        }
      },
      {
        "id": "w1_d",
        "text": "借故离开餐桌",
        "effects": {
          "self_selfEsteem": 5,
          "self_social": -15,
          "self_sensitivity": 0,
          "self_compliance": 5,
          "self_stress": 12,
          "father_selfEsteem": -10,
          "mother_selfEsteem": -5,
          "sibling_selfEsteem": -3,
          "friendSame_selfEsteem": 0,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": -5
        }
      }
    ]
  },
  {
    "id": "woman_2",
    "stage": "青年",
    "theme": "general",
    "title": "工作的机会",
    "description": "公司有个重要项目需要派驻外地两年，负责人点名要你。晋升机会很好，但意味着要离开男朋友和家人。男朋友说如果你去我们就分手。",
    "options": [
      {
        "id": "w2_a",
        "text": "为了感情留下，放弃这个机会",
        "effects": {
          "self_selfEsteem": -20,
          "self_social": 10,
          "self_sensitivity": 5,
          "self_compliance": 20,
          "self_stress": 15,
          "father_selfEsteem": 10,
          "mother_selfEsteem": 10,
          "sibling_selfEsteem": 0,
          "friendSame_selfEsteem": -8,
          "friendOpposite_selfEsteem": 15,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": 10
        }
      },
      {
        "id": "w2_b",
        "text": "接受项目，和男朋友商量异地恋",
        "effects": {
          "self_selfEsteem": 20,
          "self_social": -10,
          "self_sensitivity": -8,
          "self_compliance": -15,
          "self_stress": 20,
          "father_selfEsteem": 5,
          "mother_selfEsteem": 5,
          "sibling_selfEsteem": 5,
          "friendSame_selfEsteem": 10,
          "friendOpposite_selfEsteem": -20,
          "teacher_selfEsteem": 8,
          "relative_selfEsteem": -8
        }
      },
      {
        "id": "w2_c",
        "text": "和男朋友深入沟通，寻找两全的方案",
        "effects": {
          "self_selfEsteem": 15,
          "self_social": 15,
          "self_sensitivity": 10,
          "self_compliance": 5,
          "self_stress": 5,
          "father_selfEsteem": 5,
          "mother_selfEsteem": 10,
          "sibling_selfEsteem": 5,
          "friendSame_selfEsteem": 8,
          "friendOpposite_selfEsteem": 8,
          "teacher_selfEsteem": 5,
          "relative_selfEsteem": 3
        }
      },
      {
        "id": "w2_d",
        "text": "提出分手，专心发展事业",
        "effects": {
          "self_selfEsteem": 15,
          "self_social": -15,
          "self_sensitivity": -15,
          "self_compliance": -20,
          "self_stress": 25,
          "father_selfEsteem": 0,
          "mother_selfEsteem": 5,
          "sibling_selfEsteem": 5,
          "friendSame_selfEsteem": 10,
          "friendOpposite_selfEsteem": -25,
          "teacher_selfEsteem": 5,
          "relative_selfEsteem": -10
        }
      }
    ]
  },
  {
    "id": "general_child2",
    "stage": "童年",
    "theme": "general",
    "title": "生日会的缺席",
    "description": "你生日那天，妈妈答应要办一个生日会。但那天她说工作太忙取消了。你一个人坐在房间里，看着准备好的气球和装饰品。",
    "options": [
      {
        "id": "gch_a",
        "text": "大发脾气，摔东西",
        "effects": {
          "self_selfEsteem": 5,
          "self_social": -10,
          "self_sensitivity": 8,
          "self_compliance": -15,
          "self_stress": 18,
          "father_selfEsteem": -10,
          "mother_selfEsteem": -15,
          "sibling_selfEsteem": -8,
          "friendSame_selfEsteem": -5,
          "friendOpposite_selfEsteem": -3,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": -3
        }
      },
      {
        "id": "gch_b",
        "text": "什么都不说，默默承受",
        "effects": {
          "self_selfEsteem": -15,
          "self_social": -10,
          "self_sensitivity": 5,
          "self_compliance": 15,
          "self_stress": 20,
          "father_selfEsteem": 3,
          "mother_selfEsteem": 5,
          "sibling_selfEsteem": -5,
          "friendSame_selfEsteem": -3,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": 0
        }
      },
      {
        "id": "gch_c",
        "text": "写日记记录下感受",
        "effects": {
          "self_selfEsteem": 10,
          "self_social": 3,
          "self_sensitivity": 10,
          "self_compliance": 5,
          "self_stress": -10,
          "father_selfEsteem": 3,
          "mother_selfEsteem": 5,
          "sibling_selfEsteem": 3,
          "friendSame_selfEsteem": 5,
          "teacher_selfEsteem": 5,
          "relative_selfEsteem": 3
        }
      },
      {
        "id": "gch_d",
        "text": "偷偷在被子里哭，觉得是自己不够好",
        "effects": {
          "self_selfEsteem": -25,
          "self_social": -8,
          "self_sensitivity": -5,
          "self_compliance": 18,
          "self_stress": 28,
          "father_selfEsteem": -5,
          "mother_selfEsteem": -8,
          "sibling_selfEsteem": -3,
          "friendSame_selfEsteem": -5,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": -3
        }
      }
    ]
  },
  {
    "id": "general_mid",
    "stage": "中年",
    "theme": "general",
    "title": "职场天花板",
    "description": "你工作十几年，能力不差，但一直没有晋升。新来的男同事比你晚来三年，已经升了两级。领导在开会时说：这个岗位需要能出差的，男孩子更方便。",
    "options": [
      {
        "id": "gm_a",
        "text": "找领导谈一谈，表达自己的晋升意愿",
        "effects": {
          "self_selfEsteem": 12,
          "self_social": 5,
          "self_sensitivity": 3,
          "self_compliance": -15,
          "self_stress": 15,
          "father_selfEsteem": 0,
          "mother_selfEsteem": 5,
          "sibling_selfEsteem": 5,
          "friendSame_selfEsteem": 8,
          "friendOpposite_selfEsteem": 5,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": -5
        }
      },
      {
        "id": "gm_b",
        "text": "接受现实，专注于家庭",
        "effects": {
          "self_selfEsteem": -15,
          "self_social": 8,
          "self_sensitivity": 5,
          "self_compliance": 20,
          "self_stress": 10,
          "father_selfEsteem": 10,
          "mother_selfEsteem": 8,
          "sibling_selfEsteem": 5,
          "friendSame_selfEsteem": 0,
          "friendOpposite_selfEsteem": 5,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": 10
        }
      },
      {
        "id": "gm_c",
        "text": "开始投简历，找新工作",
        "effects": {
          "self_selfEsteem": 18,
          "self_social": -5,
          "self_sensitivity": -8,
          "self_compliance": -18,
          "self_stress": 20,
          "father_selfEsteem": -10,
          "mother_selfEsteem": -5,
          "sibling_selfEsteem": 3,
          "friendSame_selfEsteem": 5,
          "friendOpposite_selfEsteem": 3,
          "teacher_selfEsteem": 5,
          "relative_selfEsteem": -8
        }
      },
      {
        "id": "gm_d",
        "text": "和先生商量，让他多承担家务",
        "effects": {
          "self_selfEsteem": 8,
          "self_social": 10,
          "self_sensitivity": 8,
          "self_compliance": 5,
          "self_stress": -5,
          "father_selfEsteem": -5,
          "mother_selfEsteem": 10,
          "sibling_selfEsteem": 0,
          "friendSame_selfEsteem": 8,
          "friendOpposite_selfEsteem": 10,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": 3
        }
      }
    ]
  },
  {
    "id": "general_elder",
    "stage": "老年",
    "theme": "general",
    "title": "遗产分配",
    "description": "父母去世后，亲戚们聚在一起讨论遗产分配。按传统习俗，嫁出去的女儿没有继承权。你的弟弟已经拿了大部分财产，还说：法律规定女儿也有份，但按照我们家的规矩，你不应该要。",
    "options": [
      {
        "id": "ge_a",
        "text": "据理力争，依法维权",
        "effects": {
          "self_selfEsteem": 20,
          "self_social": -15,
          "self_sensitivity": 5,
          "self_compliance": -25,
          "self_stress": 25,
          "father_selfEsteem": -20,
          "mother_selfEsteem": -15,
          "sibling_selfEsteem": -25,
          "friendSame_selfEsteem": 8,
          "friendOpposite_selfEsteem": 5,
          "teacher_selfEsteem": 5,
          "relative_selfEsteem": -20
        }
      },
      {
        "id": "ge_b",
        "text": "算了，不要伤和气，主动放弃",
        "effects": {
          "self_selfEsteem": -20,
          "self_social": 10,
          "self_sensitivity": -5,
          "self_compliance": 25,
          "self_stress": 15,
          "father_selfEsteem": 10,
          "mother_selfEsteem": 5,
          "sibling_selfEsteem": 15,
          "friendSame_selfEsteem": -8,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": 15
        }
      },
      {
        "id": "ge_c",
        "text": "请律师介入，不通过家族调解",
        "effects": {
          "self_selfEsteem": 18,
          "self_social": -20,
          "self_sensitivity": -5,
          "self_compliance": -20,
          "self_stress": 20,
          "father_selfEsteem": -15,
          "mother_selfEsteem": -10,
          "sibling_selfEsteem": -20,
          "friendSame_selfEsteem": 5,
          "teacher_selfEsteem": 3,
          "relative_selfEsteem": -15
        }
      },
      {
        "id": "ge_d",
        "text": "提出只拿父母的遗物，放弃财产",
        "effects": {
          "self_selfEsteem": 10,
          "self_social": 15,
          "self_sensitivity": 12,
          "self_compliance": 10,
          "self_stress": -10,
          "father_selfEsteem": 5,
          "mother_selfEsteem": 8,
          "sibling_selfEsteem": 8,
          "friendSame_selfEsteem": 10,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": 5
        }
      }
    ]
  },
  {
    "id": "general_child",
    "stage": "童年",
    "theme": "general",
    "title": "弟弟的优先权",
    "description": "妈妈从集市回来，给弟弟买了新玩具和零食。你眼巴巴地看着，妈妈说：你是姐姐，要懂事。弟弟比你还小，但他总是能得到更多关注和礼物。",
    "options": [
      {
        "id": "gc_a",
        "text": "大哭大闹，凭什么弟弟总是有特权",
        "effects": {
          "self_selfEsteem": -10,
          "self_social": -15,
          "self_sensitivity": 10,
          "self_compliance": -20,
          "self_stress": 20,
          "father_selfEsteem": -10,
          "mother_selfEsteem": -15,
          "sibling_selfEsteem": 5,
          "friendSame_selfEsteem": -5,
          "friendOpposite_selfEsteem": 0,
          "teacher_selfEsteem": -5,
          "relative_selfEsteem": -8
        }
      },
      {
        "id": "gc_b",
        "text": "默默回房间，不说话",
        "effects": {
          "self_selfEsteem": -15,
          "self_social": -10,
          "self_sensitivity": 5,
          "self_compliance": 15,
          "self_stress": 18,
          "father_selfEsteem": 3,
          "mother_selfEsteem": -5,
          "sibling_selfEsteem": 3,
          "friendSame_selfEsteem": -8,
          "teacher_selfEsteem": 0,
          "relative_selfEsteem": 0
        }
      },
      {
        "id": "gc_c",
        "text": "问妈妈：我也可以要一个吗？",
        "effects": {
          "self_selfEsteem": 8,
          "self_social": 5,
          "self_sensitivity": 3,
          "self_compliance": -5,
          "self_stress": -8,
          "father_selfEsteem": 0,
          "mother_selfEsteem": 5,
          "sibling_selfEsteem": 0,
          "friendSame_selfEsteem": 3,
          "teacher_selfEsteem": 3,
          "relative_selfEsteem": 0
        }
      },
      {
        "id": "gc_d",
        "text": "假装不在乎，去找朋友玩",
        "effects": {
          "self_selfEsteem": -5,
          "self_social": 8,
          "self_sensitivity": -3,
          "self_compliance": -8,
          "self_stress": -5,
          "father_selfEsteem": 0,
          "mother_selfEsteem": -3,
          "sibling_selfEsteem": -3,
          "friendSame_selfEsteem": 8,
          "teacher_selfEsteem": 3,
          "relative_selfEsteem": -3
        }
      }
    ]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = MOCK_SCENARIOS;
} else {
  window.MOCK_SCENARIOS = MOCK_SCENARIOS;
}
