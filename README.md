#### 思主后端服务器

为了对不懂后端数据库等环境的人省去学习 sql 等数据库的成本，使用 json 进行储存信息

对密码进行密文加密。采用 token 方式验证用户信息

- 自动更新每日章节
- 缓存 + 本地 的存储数据方式，读使用缓存，写为 即时存储 + 写缓存

***

## 每日思主后端接口文档

#### 接口地址

> http://127.0.0.1:86

### 圣经信息

> 路由前置为 /bible

#### 获取当日思主信息

获取最新更新的经文思主内容，和下一个经文思主内容。

**请求类型**

> GET

**请求路由**

> /bible/today

**请求演示**

> /bible/today

**响应结果**

```json
{
    "code": 200,
    "msg": {
        "now": {
            "shortName": "gn",
            "index": 0,
            "lection": "创世记",
            "pic": "xxx.jpg",
            "chapter": 2,
            "day": "2024-05-09"
        },
        "after": {
            "shortName": "gn",
            "index": 1,
            "pic": "xxx.jpg",
            "lection": "创世记",
            "chapter": 3,
            "type": "old"
        }
    }
}
```

***

#### 获取思主经文列表

获取10条最新的思主经文的文章标题等列表信息

**请求类型**

> GET

**请求路由**

> /bible/list

**请求演示**

> /bible/list

**响应结果**

```json
{
    "code": 200,
    "data": [
        {
            "title": "创世记 2章",
            "pic": "xxx.jpg",
            "sortId": 5,
            "time": "2024-05-09"
        },
        {
            "title": "创世记 1章",
            "pic": "xxx.jpg",
            "sortId": 4,
            "time": "2024-05-08"
        }
    ]
}
```

***

#### 获取思主经文详情

传入对应 ``params`` 的 ``sortId``  参数获取对应的经文详细内容；``sortId`` 与经文 ``id`` 的效果是一致的。

**请求类型**

> GET

**请求路由**

> bible/detail/:id

**请求参数**

| 请求参数 | 参数类型       | 是否必填 | 说明                                                 |
| -------- | -------------- | -------- | ---------------------------------------------------- |
| ``:id``  | number\|string | 是       | 注意传入的是 ``params`` 参数，获取 ``id`` 对应的经文 |

**请求演示**

> /bible/detail/4

**响应结果**

```json
{
    "code": 200,
    "data": {
        "title": "创世记 1章",
        "content": [
            "起初，神创造天地。",
            "地是空虚混沌，渊面黑暗；神的灵运行在水面上。",
            "神说：要有光，就有了光。",
            "神看光是好的，就把光暗分开了。",
            "神称光为昼，称暗为夜。有晚上，有早晨，这是头一日。",
            "神说：诸水之间要有空气，将水分为上下。",
            "神就造出空气，将空气以下的水、空气以上的水分开了。事就这样成了。",
            "神称空气为天。有晚上，有早晨，是第二日。",
            "神说：天下的水要聚在一处，使旱地露出来。事就这样成了。",
            "神称旱地为地，称水的聚处为海。神看著是好的。",
            // ...
        ],
        "id": 4,
        "pic": "xxx.jpg",
        "time": "2024-05-08"
    }
}
```

***

#### 获取思主评论列表

传入对应 ``query`` 的 ``Id``  参数获取对应的经文详细内容；``sortId`` 与经文 ``id`` 的效果是一致的。

**请求类型**

> GET

**请求路由**

> /bible/getmsg

**请求参数**

| 请求参数 | 参数类型       | 是否必填 | 说明                                   |
| -------- | -------------- | -------- | -------------------------------------- |
| ``id``   | number\|string | 是       | 获取经文 ``id`` 对应的思主发帖列表信息 |

**请求演示**

> /bible/getmsg?id=4

**响应结果**

```json
{
    "code": 200,
    "data": [
        {
            "pid": 1,
            "user": "B510102",
            "isdel": false,
            "time": "2024-05-01 10:11",
            "content": "好的，我是评论"
        },
        {
            "pid": 12,
            "user": "B510102",
            "isdel": false,
            "time": "2024-05-09 00:44",
            "content": "我还是喜欢写评论的，毕竟比较简单的说"
        },
        {
            "pid": 14,
            "user": "B50010",
            "isdel": false,
            "time": "2024-05-09 17:57",
            "content": "这是一段发帖内容，今天天气挺好的。凑够10个字"
        }
    ]
}
```

***



### 用户信息

> 路由前置为 /user

用户登录和发帖的接口，其中 ``/user/sigin`` 与 ``/user/login`` 路由不需要携带 ``Authorization`` 的 ``token`` 请求头。其他的均要提交 ``token`` 请求信息

``token`` 信息请保留到本地，否则无法实现后续 ``/user`` 接口下的验证环节

#### 注册用户账号

用于注册用户账号信息，创建用户；获取用户请求信息 ``token`` 

**请求类型**

> POST

**请求路由**

> /user/sigin

**请求参数**

| 请求参数 | 参数类型 | 是否必填 | 说明                                       |
| -------- | -------- | -------- | ------------------------------------------ |
| username | string   | 是       | 用户的用户名，需存在英文和数字，长度为5-10 |
| password | string   | 是       | 用户的密码，长度为3-20                     |

**请求演示**

![1715246428671](assets/1715246428671.png)

**响应结果**

```json
{
    "code": 200,
    "msg": "注册成功！",
    "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkI1MDAxMCIsInBhc3N3b3JkIjoiJDJhJDEwJDBydEJlNXJQNDBWcG84VU40STdSQS5PYU9TS0pFSTRPMnQydURhd213RGZTTm5aaHBuam1HIiwiaWF0IjoxNzE1MjQ2NDA0fQ.tc6EEr4ZCaMjUYk_JgLAwCfK3e8nJyCmIeWqAAtoJN8"
}
```

***

#### 登录用户账号

用于登录用户账号信息，获取用户请求信息 ``token`` 

**请求类型**

> POST

**请求路由**

> /user/login

**请求参数**

| 请求参数 | 参数类型 | 是否必填 | 说明                                       |
| -------- | -------- | -------- | ------------------------------------------ |
| username | string   | 是       | 用户的用户名，需存在英文和数字，长度为5-10 |
| password | string   | 是       | 用户的密码，长度为3-20                     |

**请求演示**

![1715246428671](assets/1715246428671.png)

**响应结果**

```json
{
    "code": 200,
    "msg": "登录成功!",
    "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkI1MDAxMCIsInBhc3N3b3JkIjoiMTIzNDU2IiwiaWF0IjoxNzE1MjQ2NTI4fQ.BnYj_UMwBClIPqiKaUr6MBVA3aoT0dCvEJ7qibWoFls"
}
```

***

#### 获取用户信息

`该接口需要携带 Authorization 的 token 请求头`

通过 ``token`` 去获取用于获取用户账号信息

**请求类型**

> GET

**请求路由**

> /user/info

**请求演示**

> user/info

**响应结果**

```json
{
    "code": 200,
    "data": {
        "username": "B50010",
        "uid": 2,
        "discard": false,
        "pic": ""
    }
}
```

***

#### 发送思主内容

`该接口需要携带 Authorization 的 token 请求头`

通过思主经文的 ``id`` ，对指定文章下发送思主信息

**请求类型**

> POST

**请求路由**

> /user/setmsg

**请求参数**

| 请求参数 | 参数类型 | 是否必填 | 说明                              |
| -------- | -------- | -------- | --------------------------------- |
| id       | string   | 是       | 思主经文的 ``sortid`` 或者 ``id`` |
| content  | string   | 是       | 思主内容                          |


**请求演示**

![1715248651793](assets/1715248651793.png)

**响应结果**

```json
{
    "code": 200,
    "data": "写入完成"
}
```

***