# webssh

# 截图
![avatar](https://github.com/liu1083947028/webssh/blob/master/screenshots/1.png?raw=true)

![avatar](https://github.com/liu1083947028/webssh/blob/master/screenshots/2.png?raw=true)

# 使用方法
1. 下载下来后，执行 npm i
2. npm start 
3. 浏览器中访问http://127.0.0.1:4028 

# 工作原理
```
+---------+     http     +--------+    ssh    +-----------+
| browser | <==========> | webssh | <=======> | ssh server|
+---------+   websocket  +--------+    ssh    +-----------+
```
