/* global ParanomaRoaming */

$(function () {
    var pictures = (function () {
        var pictures = [],
            // count,
            name,
            url,
            start = 0,
            end = 195,
            // end = 120,
            baseUrl = 'pictures/1000/',
            // baseUrl = 'pictures/2000/',
            // baseUrl = 'pictures/3000x1M/',
            index = '';

        for (var i = start; i < end; i++) {
            var picture = {
                name: null,
                url: null,
                audio: null
            };

            if (i < 10) {
                index = '000' + i;
                // picture.audio = 'audio/Amernan - The Last Of The Mohicans.mp3';
                picture.audio = 'audio/horse.ogg';
                picture.subTitles = [{
                    top: '',
                    left: 0,
                    bottom: 0,
                    right: '',
                    url: 'subtitles/subtitles-1.png'
                }, {
                    top: '',
                    left: '',
                    bottom: 0,
                    right: 0,
                    url: 'subtitles/subtitles-2.png'
                }];
            } else if (i < 100) {
                index = '00' + i;
                // picture.audio = 'audio/Amernan - The Last Of The Mohicans.mp3';
                picture.audio = 'audio/horse-2.ogg';
                picture.subTitles = [{
                    top: '',
                    left: 0,
                    bottom: 0,
                    right: '',
                    url: 'subtitles/subtitles-2.png'
                }, {
                    top: '',
                    left: '',
                    bottom: 0,
                    right: 0,
                    url: 'subtitles/subtitles-1.png'
                }];
            } else {
                index = '0' + i;
                picture.audio = 'audio/horse.ogg';
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
        container: 'paranoma-roaming-container',
        pictures: pictures,
        navbar: [
            // 'fullscreen',
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
            'moveTodown',
            'moveToCenter',
            'speedUp',
            'speedDown'
        ],
        baseUrl: 'paranoma-roaming/',
        loadingVideo: 'video/mov_bbb.mp4',
        loadingImage: 'video/clock.png',
        // loadingVideoLoop: true,
        bgAudio: 'audio/Amernan - The Last Of The Mohicans.mp3',
        bgAudioVolume: 0.2

    });

    window.pr = pr;
});
