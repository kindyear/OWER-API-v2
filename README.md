<div align="center">

<img width="400" src="./docs/logo-v2.png" alt="logo"></img>

----

> **若你还使用[OWER-API](https://github.com/kindyear/OWER-API)，请切换至本v2版本，原版本不再维护且不再可用**
>
> **接口规范基本无改变，可在不影响原工作环境的基础上进行迁移更新**

OWER-API-v2是一个基于NodeJS和Puppeteer的守望先锋2（Overwatch2）国际服玩家生涯数据获取程序、

这个项目的名字来源于Overwatch Player，于是缩写成了OWER

<img src="https://img.shields.io/github/stars/kindyear/OWER-API.svg?style=flat-square">

<img src="https://img.shields.io/github/forks/kindyear/OWER-API.svg?style=flat-square">

<img src="https://img.shields.io/github/issues/kindyear/OWER-API.svg?style=flat-square">

<img src="https://img.shields.io/github/languages/code-size/kindyear/OWER-API.svg?style=flat-square">

<img src="https://img.shields.io/github/repo-size/kindyear/OWER-API.svg?style=flat-square">

<img src="https://img.shields.io/github/last-commit/kindyear/OWER-API.svg?style=flat-square">

<img src="https://img.shields.io/github/languages/top/kindyear/OWER-API.svg?style=flat-square">

</div>

# 部署

要求：NodeJS 18.19.0（此版本上正常运行，其他版本未做测试）

端口默认为``16524``

> 注意：由于中国大陆的网络环境，国际服的数据获取速度可能会很慢，甚至无法获取，所以建议在境外的服务器上部署

确保部署主机上已经安装了Git，并在准备部署的目录下执行以下命令：

```bash
git clone https://github.com/kindyear/OWER-API-v2.git
```

然后运行项目

```bash
node app.js
```

不建议将端口设置为80或者其它常用端口，防止和已有服务，例如Nginx或者Apache等服务冲突，你可以使用反向代理功能将其代理到80端口或者其它你想设置的端口上

# API文档

API路径为：``http(s)://yourdomain.com:port/v2/api/{ROUTER}``

其中将ROUTER替换为你要请求的路由接口

## 全局参数

``apiKey``：必需，用于认证访问API的访问密钥。可在``项目目录/config/config.js``中修改

`playerTag`：必需，玩家的BattleTag（战网ID），例如：``KINDYEAR-1336``，将``#``替换为``-``

``refreshCache``：可选，是否刷新缓存(true / false)，默认情况下为自动处理，配置文件默认设置缓存有效期为12小时，当缓存过期时程序会自动获取新的内容，如果手动指定为true则该次请求会刷新缓存数据

## API端点

### 获取玩家基础生涯信息

- URL：``/v2/api/playerInfo?{playerTag}&{apiKey}``
- 方法：``GET``
- 响应

```json
{
  "private": false,
  "playerBaseInfo": {
    "playerTag": "KINDYEAR-1336",
    "playerName": "KINDYEAR",
    "playerTitle": "Extraterrestrial",
    "playerIcon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5c670baeda5a7b2ed707c940f6b17773e9fd41fe783a8810ea9283cd55d6fd43.png",
    "playerIconID": "0x02500000000068A2",
    "playerNameCardID": "0x02500000000068A2",
    "endorsementLevel": 2
  },
  "playerCompetitiveInfo": {
    "PC": {
      "Tank": {
        "playerCompetitivePCTank": "Platinum",
        "playerCompetitivePCTankTier": 2
      },
      "Damage": {
        "playerCompetitivePCDamage": "Gold",
        "playerCompetitivePCDamageTier": 2
      },
      "Support": {
        "playerCompetitivePCSupport": "Gold",
        "playerCompetitivePCSupportTier": 3
      }
    },
    "Console": {
      "Tank": null,
      "Damage": null,
      "Support": null
    }
  },
  "refreshCache": false,
  "currentTime": 1690110879
}
```

数据解释：

* ``private``：玩家是否设置了隐私，如果设置了隐私，将会返回``true``，否则返回``false``
* ``playerBaseInfo``：玩家基础信息
    * ``playerTag``：玩家的BattleTag（战网ID）
    * ``playerName``：玩家的昵称
    * ``playerTitle``：玩家的头衔
    * ``playerIcon``：玩家的头像
    * ``playerIconID``：玩家的头像ID
    * ``playerNameCardID``：玩家的名片ID
        * ``endorsementLevel``：玩家的赞赏等级
* ``playerCompetitiveInfo``：玩家的竞技比赛信息
    * ``PC``/`Console`：玩家的PC端竞技比赛信息
        * ``Tank``：玩家的坦克信息
            * ``playerCompetitivePC / ConsoleTank``：玩家的坦克段位
            * ``playerCompetitivePC / ConsoleTankTier``：玩家的坦克段位等级
        * ``Damage``：玩家的输出信息
            * ``playerCompetitivePC / ConsoleDamage``：玩家的输出段位
            * ``playerCompetitivePC / ConsoleDamageTier``：玩家的输出段位等级
        * ``Support``：玩家的辅助信息
            * ``playerCompetitivePC / ConsoleSupport``：玩家的辅助段位
            * ``playerCompetitivePC / ConsoleSupportTier``：玩家的辅助段位等级
* ``currentTime``：当前时间戳
* ``refreshCache``：是否刷新缓存

> 由于暴雪的限制，无法获取到五百强的具体排名，所有五百强的段位显示为GrandMaster-1，也就是宗师1
>
> 段位只显示当前赛季段位，无法查看之前赛季的段位
>
> 此外，暴雪似乎并没有提供开放职责的段位信息（游戏里面有但是我弄不出来），所以这里全部显示的是预设职责的段位
>
>
> 守望先锋2在第九赛季更新后，无法查询生涯为隐私的玩家信息
>
> 即如果该玩家设置为隐私生涯，则会直接提示无法找到该玩家，也就意味着无法获取其赞赏等级，名片以及头衔信息

### 平台端口数据

> 这里以PC平台为例，若要使用主机数据，将API路径中的PC替换为Console即可，本文不做过多赘述

#### 获取玩家快速游戏排行信息

- URL：`/v2/api/playerPCQuickInfo?{playerTag}&{apiKey}&{type}`

- 方法：``GET``

- 参数：`{type}`：必需，请求的排行榜类型，具体参数以解释如下

|        `type`类型         |     解释说明     |
|:-----------------------:|:------------:|
|      `time-played`      |    角色游戏时间    |
|       `games-won`       |    角色胜利场数    |
|    `weapon-accuracy`    |   角色武器命中率    |
| `eliminations-per-life` | 角色击杀数 / 每条生命 |
| `critical-hit-accuracy` |    角色暴击率     |
|    `multikill-best`     |   角色最多单次消灭   |
|    `objective-kills`    |   角色目标点内击杀   |

注释：其中目标点内击杀为玩家在目标内/附近击杀的玩家总数，包含运载目标或者目标点。此外数据排列格式为由多到少排列，具体可看响应

- 响应

```json
{
  "private": false,
  "playerTag": "KINDYEAR-1336",
  "playerName": "KINDYEAR",
  "playerIcon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7680cd5f24ef316f4218917ef5a8e8f1b9d2d39c14805c35a9a5542440464ffa.png",
  "playerIconID": "0x02500000000068A2",
  "playerNameCardID": "0x02500000000068A2",
  "gameMode": "quickPlay",
  "platform": "pc",
  "type": "weapon-accuracy",
  "heroRankings": [
    {
      "heroName": "Sigma",
      "heroData": "46%"
    },
    {
      "heroName": "Mei",
      "heroData": "44%"
    },
    {
      "heroName": ".......",
      "heroData": "......."
    },
    {
      "heroName": "Moira",
      "heroData": "0"
    }
  ],
  "refreshCache": false,
  "currentTime": 1690184120150
}
```

数据解释：

* ``private``：玩家是否设置了隐私，如果设置了隐私，将会返回``true``，否则返回``false``
* ``playerTag``：玩家的BattleTag（战网ID）
* ``playerName``：玩家的昵称
* ``playerIcon``：玩家的头像
* ``playerIconID``：玩家的头像ID
* ``playerNameCardID``：玩家的名片ID
* ``gameMode``：游戏模式（分为`quickPlay`快速模式和`competitive`竞技模式）
* ``platform``：平台，分为``pc``和``console``
* ``type``：请求的数据排行类型
* ``heroRankings``：英雄排行数据
    * ``heroName``：英雄名称
    * ``heroData``：英雄数据
    * ........
* ``currentTime``：当前时间戳
* ``refreshCache``：是否刷新缓存

#### 获取玩家竞技游戏排行信息

- URL：`/v2/api/playerPCCompetitiveInfo?{playerTag}&{apiKey}&{type}`

- 方法：``GET``

- 参数：`{type}`：必需，请求的排行榜类型，具体参数以解释如下

|        `type`类型         |     解释说明     |
|:-----------------------:|:------------:|
|      `time-played`      |    角色游戏时间    |
|       `games-won`       |    角色胜利场数    |
|    `weapon-accuracy`    |   角色武器命中率    |
|    `win-percentage`     | 角色胜率（竞技模式独有） |
| `eliminations-per-life` | 角色击杀数 / 每条生命 |
| `critical-hit-accuracy` |    角色暴击率     |
|    `multikill-best`     |   角色最多单次消灭   |
|    `objective-kills`    |   角色目标点内击杀   |

注释：``win-percentage``参数为**竞技模式**独有
快速模式不可用其中目标点内击杀为玩家在目标内/附近击杀的玩家总数，包含运载目标或者目标点。
此外，竞技模式的数据只显示当前赛季的数据，无法查看之前赛季的数据。

> 此外数据排列格式为由多到少排列，响应和数据解释与快速游戏模式相似，这里不再复述。

#### 获取玩家快速游戏英雄数据信息

- URL：`/v2/api/playerPCQuickHerosInfo?{playerTag}&{apiKey}&{heroID}`

- 方法：``GET``

- 参数：`{heroID}`：必需，请求的英雄ID，具体的heroID和英雄名称对应表请查阅：[heroID和英雄名称对应表](#heroID和英雄名称对应表)

- 响应（这里以ALL HEROS为例，不同的英雄对应的数据是不相同的）
  ```json
  {
      "private": false,
      "playerTag": "KINDYEAR-1336",
      "playerName": "KINDYEAR",
      "playerIcon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7680cd5f24ef316f4218917ef5a8e8f1b9d2d39c14805c35a9a5542440464ffa.png",
      "playerIconID": "0x02500000000068A2",
      "playerNameCardID": "0x02500000000068A2",
      "gameMode": "quickPlay",
      "platform": "pc",
      "heroID": 0,
      "heroName": "ALL HEROES",
      "heroSourceID": "0",
      "quickHeroData": [
          {
              "categoryName": "Best",
              "categoryData": [
                  {
                      "statName": "Eliminations - Most in Game",
                      "statValue": "42"
                  },
                  {
                      "statName": "Final Blows - Most in Game",
                      "statValue": "19"
                  },
                  {
                      "statName": "Healing Done - Most in Game",
                      "statValue": "18075"
                  },
                  {
                      "statName": "Objective Kills - Most in Game",
                      "statValue": "24"
                  },
                  {
                      "statName": "Objective Time - Most in Game",
                      "statValue": "06:42"
                  },
                  {
                      "statName": "Multikill - Best",
                      "statValue": "4"
                  },
                  {
                      "statName": "Solo Kills - Most in Game",
                      "statValue": "19"
                  },
                  {
                      "statName": "Melee Final Blows - Most in Game",
                      "statValue": "4"
                  },
                  {
                      "statName": "Kill Streak - Best",
                      "statValue": "22"
                  },
                  {
                      "statName": "Hero Damage Done - Most in Game",
                      "statValue": "19236"
                  },
                  {
                      "statName": "Assists - Most in Game",
                      "statValue": "30"
                  },
                  {
                      "statName": "Objective Contest Time - Most in Game",
                      "statValue": "05:09"
                  },
                  {
                      "statName": "Recon Assists - Most in Game",
                      "statValue": "14"
                  }
              ]
          },
          {
              "categoryName": "Average",
              "categoryData": [
                  {
                      "statName": "Hero Damage Done - Avg per 10 Min",
                      "statValue": "4747"
                  },
                  {
                      "statName": "Deaths - Avg per 10 Min",
                      "statValue": "4.82"
                  },
                  {
                      "statName": "Assists - Avg per 10 min",
                      "statValue": "11.65"
                  },
                  {
                      "statName": "Eliminations - Avg per 10 Min",
                      "statValue": "12.37"
                  },
                  {
                      "statName": "Healing Done - Avg per 10 Min",
                      "statValue": "5783"
                  },
                  {
                      "statName": "Objective Kills - Avg per 10 Min",
                      "statValue": "5.05"
                  },
                  {
                      "statName": "Objective Time - Avg per 10 Min",
                      "statValue": "01:23"
                  },
                  {
                      "statName": "Final Blows - Avg per 10 Min",
                      "statValue": "4.73"
                  },
                  {
                      "statName": "Time Spent on Fire - Avg per 10 Min",
                      "statValue": "00:32"
                  },
                  {
                      "statName": "Objective Contest Time - Avg per 10 Min",
                      "statValue": "00:43"
                  },
                  {
                      "statName": "Solo Kills - Avg per 10 Min",
                      "statValue": "0.61"
                  }
              ]
          },
          {
              "categoryName": "Game",
              "categoryData": [
                  {
                      "statName": "Time Played",
                      "statValue": "51:59:15"
                  },
                  {
                      "statName": "Games Played",
                      "statValue": "368"
                  },
                  {
                      "statName": "Games Won",
                      "statValue": "192"
                  },
                  {
                      "statName": "Games Lost",
                      "statValue": "176"
                  }
              ]
          },
          {
              "categoryName": "Combat",
              "categoryData": [
                  {
                      "statName": "Environmental Kills",
                      "statValue": "12"
                  },
                  {
                      "statName": "Multikills",
                      "statValue": "24"
                  },
                  {
                      "statName": "Hero Damage Done",
                      "statValue": "1480665"
                  },
                  {
                      "statName": "Deaths",
                      "statValue": "1504"
                  },
                  {
                      "statName": "Eliminations",
                      "statValue": "3858"
                  },
                  {
                      "statName": "Damage Done",
                      "statValue": "1480665"
                  },
                  {
                      "statName": "Objective Kills",
                      "statValue": "1575"
                  },
                  {
                      "statName": "Final Blows",
                      "statValue": "1475"
                  },
                  {
                      "statName": "Objective Time",
                      "statValue": "07:09:06"
                  },
                  {
                      "statName": "Melee Final Blows",
                      "statValue": "65"
                  },
                  {
                      "statName": "Time Spent on Fire",
                      "statValue": "02:44:23"
                  },
                  {
                      "statName": "Objective Contest Time",
                      "statValue": "03:45:18"
                  },
                  {
                      "statName": "Solo Kills",
                      "statValue": "189"
                  }
              ]
          },
          {
              "categoryName": "Assists",
              "categoryData": [
                  {
                      "statName": "Recon Assists",
                      "statValue": "81"
                  },
                  {
                      "statName": "Assists",
                      "statValue": "3633"
                  },
                  {
                      "statName": "Healing Done",
                      "statValue": "1803937"
                  },
                  {
                      "statName": "Defensive Assists",
                      "statValue": "2951"
                  },
                  {
                      "statName": "Offensive Assists",
                      "statValue": "1422"
                  }
              ]
          }
      ],
  	"refreshCache": false,
      "currentTime": 1690344710459
  }
  ```
  数据解释：

* ``private``：玩家是否设置了隐私，如果设置了隐私，将会返回``true``，否则返回``false``
* ``playerTag``：玩家的BattleTag（战网ID）
* ``playerName``：玩家的昵称
* ``playerIcon``：玩家的头像
* ``playerIconID``：玩家的头像ID
* ``playerNameCardID``：玩家的名片ID
* ``gameMode``：游戏模式（分为`quickPlay`快速模式和`competitive`竞技模式）
* ``platform``：平台，分为``pc``和``console``
* ``heroID``：英雄ID
* ``heroName``：英雄名称
* ``heroSourceID``：英雄源ID（使用者不必关注此数据，该值的解释可以看后面）
* ``quickHeroData``：英雄数据
    * ``categoryName``：数据分类名称
    * ``categoryData``：数据分类数据
        * ``statName``：数据名称
        * ``statValue``：数据值
        * ......
        * ......
* ``currentTime``：当前时间戳
* ``refreshCache``：是否刷新缓存

#### 获取玩家竞技游戏英雄数据信息

- URL：`/v2/api/playerPCCompetitiveHerosInfo?{playerTag}&{apiKey}&{heroID}`

- 方法：``GET``

- 参数：`{heroID}`：必需，请求的英雄ID，具体的heroID和英雄名称对应表请查阅：[heroID和英雄名称对应表](#heroID和英雄名称对应表)

- 响应于快速模式英雄数据响应相似，数据解释也相似，这里不做赘述

### 部分数据解释

1. **``heroSourceID``**:由于不同玩家的英雄列表不相同，有可能某个玩家不玩某个英雄，导致`herosData.json`文件中的`heroID`
   无法一一对应，于是在处理过程中临时内建维护了一个专属于玩家自己的`heroID`对应表，而heroSourceID就是当`heroID`
   在页面上实际的ID值，而不存在的则为`null`值，这样就可以保证数据的准确性，同时也可以保证数据的完整性，不会因为某个英雄的数据不存在而导致数据不完整。

### heroID和英雄名称对应表

| heroID | 英雄名称（heroName） |  英雄简体中文名称   |
|:------:|:--------------:|:-----------:|
|   0    |   ALL HEROS    |    全部英雄     |
|   1    |      Ana       |     安娜      |
|   2    |      Ashe      |     艾什      |
|   3    |    Baptiste    |    巴蒂斯特     |
|   4    |    Bastion     |     堡垒      |
|   5    |    Brigitte    |    布里吉塔     |
|   6    |    Cassidy     | 卡西迪（永远的麦克雷） |
|   7    |      D.Va      |    D.Va     |
|   8    |    Doomfist    |    末日铁拳     |
|   9    |      Echo      |     回声      |
|   10   |     Genji      |     源氏      |
|   11   |     Hanzo      |     半藏      |
|   12   |  Junker Queen  |    渣客女王     |
|   13   |    Junkrat     |     狂鼠      |
|   14   |     Kiriko     |     雾子      |
|   15   |   Lifeweaver   |    生命之梭     |
|   16   |     Lúcio      |     卢西奥     |
|   17   |      Mei       |      美      |
|   18   |     Mercy      |     天使      |
|   19   |     Moira      |     莫伊拉     |
|   20   |     Orisa      |     奥丽莎     |
|   21   |     Pharah     |    法老之鹰     |
|   22   |    Ramattra    |     拉玛刹     |
|   23   |     Reaper     |     死神      |
|   24   |   Reinhardt    |    莱因哈特     |
|   25   |    Roadhog     |     路霸      |
|   26   |     Sigma      |     西格玛     |
|   27   |    Sojourn     |     索杰恩     |
|   28   |  Soldier: 76   |    士兵：76    |
|   29   |     Sombra     |     黑影      |
|   30   |    Symmetra    |    秩序之光     |
|   31   |    Torbjörn    |     托比昂     |
|   32   |     Tracer     |     猎空      |
|   33   |   Widowmaker   |     黑百合     |
|   34   |    Winston     |     温斯顿     |
|   35   | Wrecking Ball  |     破坏球     |
|   36   |     Zarya      |     查莉娅     |
|   37   |    Zenyatta    |     禅雅塔     |
|   38   |     Illari     |     伊拉锐     |
|   39   |     Mauga      |     毛加      |


# TODO

- [x] 实现缓存功能
- [x] 多线程处理（多核）
- [x] 玩家基础游戏信息
- [x] PC玩家快速游戏信息
- [x] PC玩家竞技游戏信息
- [x] PC玩家快速游戏各英雄信息
- [x] PC玩家竞技游戏各英雄信息
- [x] 主机玩家快速游戏信息
- [x] 主机玩家快速游戏信息
- [x] 主机玩家快速游戏各英雄信息
- [x] 主机玩家竞技游戏各英雄信息

# 启发 / 感谢

> 排名不分前后

- https://zusor.io/（项目启发）
- Linus
- 花散里
- 低调做人

# 免责声明

OWER项目不隶属于暴雪，也不反映暴雪或任何正式参与制作或管理《守望先锋》的人的观点或意见。Overwatch 和 Blizzard 是 Blizzard
Entertainment, Inc. 的商标或注册商标。 Overwatch © Blizzard Entertainment, Inc.

其中所产生的部分数据内容版权归暴雪娱乐所有，OWER项目仅用于学习交流，不得用于商业用途。

此外，暴雪随时可能会调整数据来源网页的访问规则或者数据格式，项目不保证即时更新。

我们不保证正常运行时间、响应时间或支持。您使用此项目的风险由您自行承担。

# 许可证

如果满足以下条件，则允许以源代码和二进制形式重新分发和使用，无论是否经过修改：

- 源代码的重新分发必须保留上述版权声明、此条件列表和以下免责声明。
- 以二进制形式重新分发必须在随分发提供的文档和/或其他材料中复制上述版权声明、此条件列表以及以下免责声明。

本软件由版权所有者和贡献者“按原样”提供，不承担任何明示或默示的保证，包括但不限于适销性和特定用途适用性的默示保证。在任何情况下，版权持有人或贡献者均不对任何直接、间接、附带、特殊、惩戒性或后果性损害（包括但不限于采购替代商品或服务；使用、数据或利润损失；或业务中断）承担责任因使用本软件而以任何方式引起的以及基于任何责任理论的责任，无论是合同责任、严格责任还是侵权行为（包括疏忽或其他），即使已被告知可能发生此类损害。
