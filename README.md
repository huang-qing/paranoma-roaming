# paranoma roaming 全景漫游


~~~javascript

$(function() {
    var pictures = (function() {
        var pictures = [],
            name,
            url,
            start = 0,
            end = 195,
            baseUrl = 'src/pictures/1000/',
            index = '';

        for (var i = start; i < end; i++) {
            var picture = {
                //图片的名称
                name: null,
                //图片的路径
                url: null,
                //音频：每个图片中指定需要播放音频的url，当url改变时切换音乐
                audio: null
            };

            if (i < 10) {
                index = '000' + i;
                picture.audio = 'src/audio/Amernan - The Last Of The Mohicans.mp3';
            } else if (i < 100) {
                index = '00' + i;
                picture.audio = 'src/audio/horse.ogg';
            } else {
                index = '0' + i;
                picture.audio = 'src/audio/Amernan - The Last Of The Mohicans.mp3';
            }

            name = index + '.jpg';
            url = baseUrl + name;

            picture.name = name;
            picture.url = url;
            pictures.push(picture);
        }

        return pictures;
    }());

    var pr = new ParanomaRoaming({
        //指定容器id
        container: 'paranoma-roaming-container',
        //图片集
        pictures: pictures,
        //导航栏：不配置此项，导航栏将不显示
        navbar: [
            //全屏
            'fullscreen',
            //图片名称
            'caption',
            //开始按钮
            'play',
            //暂停按钮
            'pause',
            //持续向左
            'moveleft',
            //持续向右
            'moveright',
            //持续向上
            'moveup',
            //持续向下
            'movedown',
            //前进
            'moveforward',
            //后退
            'moveback',
            //向左
            'moveToleft',
            //向右
            'moveToright',
            //向上
            'moveToup',
            //向下
            'moveTodown'
        ],
        //指定插件跟路径
        baseUrl: 'dist/paranoma-roaming/',
        //开始动画
        loadingVideo: 'src/video/mov_bbb.mp4',
        //背景音乐
        bgAudio: 'src/audio/Amernan - The Last Of The Mohicans.mp3',
        //背景音乐音量
        bgAudioVolume: '0.3'
    });

    window.pr = pr;

    // api 调用
    //播放
    pr.play();
    //暂停
    pr.pause();
    //向左（持续）
    pr.moveLeft();
    //向右（持续）
    pr.moveRight();
    //向上（持续）
    pr.moveUp();
    //向下（持续）
    pr.moveDown();
    //向前（持续）
    pr.moveForward();
    //向后（持续）
    pr.moveBack();
    //左右移动的速度
    pr.setSpeed(1, 'left-right');
    //上下移动的速度
    pr.setSpeed(1, 'up-down');
    //前后移动的速度
    pr.setSpeed(1, 'forward-back');
    // 经度设置：负数向左，正数向右
    pr.moveTo(Math.PI / 3,null);
    // 纬度度设置：纬度有范围[Math.PI/2, -Math.PI/2]；正数向上，负数向下。
    pr.moveTo(null,Math.PI / 3);
});

~~~
