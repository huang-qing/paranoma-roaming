/* global ParanomaRoaming */

$(function() {
    var pictures = (function() {
        var pictures = [],
            // count,
            name,
            url,
            start = 0,
            end = 195,
            // end = 80,
            // baseUrl = 'pictures/',
            baseUrl = 'src/pictures/1000/',
            index = '';

        for (var i = start; i < end; i++) {
            var picture = {
                name: null,
                url: null,
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

            // name = 'zuilou_' + index + '.jpg';
            name = index + '.jpg';
            url = baseUrl + name;

            picture.name = name;
            picture.url = url;
            pictures.push(picture);
        }

        return pictures;
    }());

    var pr = new ParanomaRoaming({
        container: 'paranoma-roaming-container',
        pictures: pictures,
        navbar: [
            //'autorotate',
            //'zoom',
            //'gyroscope',
            'fullscreen',
            'caption',
            'play',
            'pause',
            'moveleft',
            'moveright',
            'moveup',
            'movedown',
            'moveforward',
            'moveback',
            'moveToleft',
            'moveToright',
            'moveToup',
            'moveTodown'
        ],
        baseUrl: 'dist/paranoma-roaming/',
        loadingVideo: 'src/video/mov_bbb.mp4',
        bgAudio: 'src/audio/Amernan - The Last Of The Mohicans.mp3'
    });

    window.pr = pr;

    // api 调用
    // pr.play();
    // pr.pause();
    // pr.moveLeft();
    // pr.moveRight();
    // pr.moveUp();
    // pr.moveDown();
    // pr.moveForward();
    // pr.moveBack();
    // pr.setSpeed(1, 'left-right');
    // pr.setSpeed(1, 'up-down');
    // pr.setSpeed(1, 'forward-back');
    // 经度设置：负数向左，正数向右
    // pr.moveTo(Math.PI / 3,null);
    // 纬度度设置：纬度有范围[Math.PI/2, -Math.PI/2]；正数向上，负数向下。
    // pr.moveTo(null,Math.PI / 3);
});
