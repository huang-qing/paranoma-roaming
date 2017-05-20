/*!
 * paranoma roaming v1.0.0
 *
 * Incluces jquery.js
 * Includes three.js
 * Includes photo sphere viewer.js
 *
 * Copyright © 2017-2017 huangqing
 * Released under the MIT license
 *
 * Date: 2017-02-26
 */

(function (PhotoSphereViewer, $, window) {
    function ParanomaRoaming(options) {
        // autorotate, zoom, download, markers, gyroscope, fullscreen , caption
        // moveleft , moveright , moveup , movedown , moveforward , moveback , play , pause
        this.navbar = options.navbar || [];
        this.container = options.container;

        this['longitude_range'] = options['longitude_range'] || [];
        this['latitude_range'] = options['latitude_range'] || [];

        // 方向
        this.left = 0;
        this.right = 0;
        this.up = 0;
        this.down = 0;
        this.forward = 0;
        this.back = 0;

        this.leftTo = 0;
        this.rightTo = 0;
        this.upTo = 0;
        this.downTo = 0;

        // 动画状态
        this.state = 'pause';
        this.stateType = {
            play: 'play',
            pause: 'pause'
        };

        // 经度
        this.longitude = 0;
        // this.longitude = -Math.PI;
        // 经度偏移量
        this.longitudeOffset = 0;
        // 经度偏移量基准
        this.longitudeDatum = 0.020;

        // 纬度
        this.latitude = 0;
        // 纬度偏移量
        this.latitudeOffset = 0;
        // 纬度偏移量基准
        this.latitudeDatum = 0.020;

        this.moveToLocation = {
            longitude: null,
            latitude: null
        };

        // 帧数
        this.frameNumber = 0;
        this.frameDatum = 1;
        this.frameNumberOffset = 0;

        this.ready = false;

        // 帧图片
        this.pictures = {
            list: options.pictures,
            count: options.pictures.length,
            index: 0,
            lastPicture: ''
        };

        // 使用材质预加载,数量小于1时不进行材质预加载
        // 经测试时，效果不好，暂时不使用
        this['cache_texture'] = 0;

        this.cache = {
            count: 50,
            current: 0,
            next: 100,
            first: true,
            finish: false,
            texture: []
        };

        this.viewer;

        // 指定pr控件路径，用于加载视频、图片、音频等iframe框架
        this.baseUrl = options.baseUrl;

        // 视频加载路径以baseUrl为基准
        this.loadingVideo = options.loadingVideo;
        this.loadingVideoLoop = options.loadingVideoLoop || false;
        this.videoContainer;
        this.video;

        this.image;
        this.loadingImage = options.loadingImage;

        // 通过baseUrl计算的相对根路径
        this.relativeUrl;

        // 预加载的iframe页面
        this.preloadWindow;

        // 最后一个播放的音频路径
        this.lastAudio = null;
        // 音频对象
        this.audio;
        // 背景音频
        this.bgAudio;
        this.bgAudioUrl = options.bgAudio || null;
        this.bgAudioVolume = options.bgAudioVolume || 0.5;

        // 路标
        // this.subTitles = [];
        this.lastSubTitles = [];

        // web worker
        this.preloadWorker;

        this.init();
    }

    ParanomaRoaming.prototype.init = function () {
        var pr = this;

        this.initRelativeUrl();
        this.initLoadingVideo();
        this.initAudio();
        this.showLoading();
        this.initPreloadPanoramas().then(function () {
            return pr.preloadPanoramasInIframe();
        }).then(function () {
            return pr.preloadPanoramasInTexture(0, pr['cache_texture'] / 2);
        }).then(function () {
            // 启动第一帧
            pr.render();
            pr.ready = true;
            pr.closeLoading();
        });
        this.initNavbar();
        this.initViewer();
    };

    ParanomaRoaming.prototype.initRelativeUrl = function () {
        var replace = '../',
            baseUrl = this.baseUrl,
            relativeUrl = '',
            len = baseUrl.split('/').length - 1;

        for (var i = 0; i < len; i++) {
            relativeUrl += replace;
        }

        this.relativeUrl = relativeUrl;
    };

    ParanomaRoaming.prototype.initLoadingVideo = function () {
        var videoContainer,
            videoIframe,
            src = this.baseUrl + 'video.html',
            loadingVideo = this.relativeUrl + this.loadingVideo,
            loadingImage = this.relativeUrl + this.loadingImage,
            loop = this.loadingVideoLoop,
            pr = this,
            contentWindow;

        if (!this.loadingVideo && !this.loadingImage) {
            return;
        }

        videoContainer = $('<div frameborder="0" class="pr-iframe-video" ><iframe src="' + src + '"></iframe></div>').appendTo('body');
        pr.videoContainer = videoContainer;
        videoIframe = videoContainer.find('iframe')[0];
        contentWindow = videoIframe.contentWindow;

        contentWindow.onload = function () {
            // 加载视频
            if (pr.loadingVideo) {
                var video = contentWindow.document.querySelector('#pr-loading-video');
                pr.video = video;
                video.src = loadingVideo;
                video.autoplay = true;
                video.loop = loop;
                video.onload = function () {

                };

                video.onended = function () {
                    videoContainer.addClass('pr-iframe-video-hidden');
                    console.log('视频播放完成');
                };
            }
            // 加载图片
            if (pr.loadingImage) {
                var image = contentWindow.document.querySelector('#pr-loading-image');
                pr.image = image;
                image.src = loadingImage;

                image.onload = function () {
                    var width = this.width,
                        height = this.height;

                    this.style.marginTop = -width / 2 + 'px';
                    this.style.marginLeft = -height / 2 + 'px';
                    this.style.display = 'block';
                };
            }
        };
    };

    ParanomaRoaming.prototype.initAudio = function () {
        var audioContainer,
            audioIframe,
            src = this.baseUrl + 'audio.html',
            contentWindow,
            pr = this;

        audioContainer = $('<div frameborder="0" class="pr-iframe-audio" ><iframe src="' + src + '"></iframe></div>').appendTo('body');
        audioIframe = audioContainer.find('iframe')[0];
        contentWindow = audioIframe.contentWindow;

        contentWindow.onload = function () {
            pr.audio = contentWindow.document.querySelector('#pr-audio');
            pr.bgAudio = contentWindow.document.querySelector('#pr-bg-audio');
            // 自动播放背景音乐
            pr.playBgAudio();
        };
    };

    ParanomaRoaming.prototype.initPreloadPanoramas = function () {
        var pictureContainer,
            pictureIframe,
            iframeSrc = this.baseUrl + 'preload.html',
            contentWindow,
            promise,
            worker,
            workerSrc = this.baseUrl + 'preload.js';

        // 初始化web worker预加载方式，创建新的后台进程在动画过程中使用
        if (typeof (Worker) !== 'undefined') {
            worker = new Worker(workerSrc);

            worker.onmessage = function (event) {
                // console.log(event.data);
            };

            worker.onerror = function (error) {
                console.log('Worker error: ' + error.message + '\n');
                alert('Worker error');
                throw error;
            };

            this.preloadWorker = worker;
        }

        // 初始化iframe预加载方式，此方式在动画过程中会造成卡顿，只在初次预加载时使用
        pictureContainer = $('<div frameborder="0" class="pr-iframe-preload" ><iframe src="' + iframeSrc + '"></iframe></div>').appendTo('body');
        pictureIframe = pictureContainer.find('iframe')[0];
        contentWindow = pictureIframe.contentWindow;

        this.preloadWindow = contentWindow;

        promise = new Promise(function (resolve, reject) {
            contentWindow.onload = function () {
                resolve();
            };
        });

        return promise;
    };

    ParanomaRoaming.prototype.initNavbar = function () {
        var navbar = [],
            pr = this,
            hash,
            items = this.navbar,
            item,
            speed = 1;

        hash = {
            'autorotate': 'autorotate',
            'zoom': 'zoom',
            'download': 'download',
            'caption': 'caption',
            'markers': 'markers',
            'gyroscope': 'gyroscope',
            'fullscreen': 'fullscreen',
            'play': {
                title: '开始',
                className: 'custom-button',
                content: '▶',
                onClick: function () {
                    pr.play();
                    console.log('play');
                },
                enabled: true
            },
            'pause': {
                title: '暂停',
                className: 'custom-button',
                content: '▪',
                onClick: function () {
                    pr.pause();
                    console.log('pause');
                },
                enabled: true
            },
            'moveleft': {
                title: '左',
                className: 'custom-button',
                content: '↶',
                onClick: function () {
                    pr.moveLeft();
                    console.log('moveLeft');
                },
                enabled: true
            },
            'moveright': {
                title: '右',
                className: 'custom-button',
                content: '↷',
                onClick: function () {
                    pr.moveRight();
                    console.log('moveRight');
                },
                enabled: true
            },
            'moveup': {
                title: '上',
                className: 'custom-button',
                content: '⇡',
                onClick: function () {
                    pr.moveUp();
                    console.log('moveUp');
                },
                enabled: true
            },
            'movedown': {
                title: '下',
                className: 'custom-button',
                content: '⇣',
                onClick: function () {
                    pr.moveDown();
                    console.log('moveDown');
                },
                enabled: true
            },
            'moveforward': {
                title: '前进',
                className: 'custom-button',
                content: '↥',
                onClick: function () {
                    pr.moveForward();
                    console.log('moveforward');
                },
                enabled: true
            },
            'moveback': {
                title: '后退',
                className: 'custom-button',
                content: '↧',
                onClick: function () {
                    pr.moveBack();
                    console.log('moveback');
                },
                enabled: true
            },
            'moveToleft': {
                title: '经度-Math.PI / 3',
                className: 'custom-button',
                content: '↰',
                onClick: function () {
                    pr.moveTo(-Math.PI / 3, null);
                    console.log('moveToleft:-Math.PI / 3');
                },
                enabled: true
            },
            'moveToright': {
                title: '经度Math.PI/3',
                className: 'custom-button',
                content: '↱',
                onClick: function () {
                    pr.moveTo(Math.PI / 3, null);
                    console.log('moveToright:Math.PI / 3');
                },
                enabled: true
            },
            'moveToup': {
                title: '纬度Math.PI / 8',
                className: 'custom-button',
                content: '⇞',
                onClick: function () {
                    pr.moveTo(null, Math.PI / 8);
                    console.log('moveToup:Math.PI / 8');
                },
                enabled: true
            },
            'moveTodown': {
                title: '纬度-Math.PI / 8',
                className: 'custom-button',
                content: '⇟',
                onClick: function () {
                    pr.moveTo(null, -Math.PI / 8);
                    console.log('moveTodown:-Math.PI / 8');
                },
                enabled: true
            },
            'moveToCenter': {
                title: '纬度0,经度0',
                className: 'custom-button',
                content: '⇪',
                onClick: function () {
                    pr.moveTo(0, 0);
                    console.log('moveToCenter:0,0');
                },
                enabled: true
            },
            'speedUp': {
                title: '加速',
                className: 'custom-button',
                content: '↟',
                onClick: function () {
                    if (speed < 1) {
                        speed = speed + 0.2;
                    } else {
                        ++speed;
                    }
                    console.log('speed:' + speed);
                    pr.setSpeed(speed, 'forward-back');
                },
                enabled: true
            },
            'speedDown': {
                title: '减速',
                className: 'custom-button',
                content: '↡',
                onClick: function () {
                    if (speed <= 1) {
                        speed = speed - 0.2;
                    } else {
                        --speed;
                    }
                    if (speed <= 0.2) {
                        speed = 0.2;
                    }
                    console.log('speed:' + speed);
                    pr.setSpeed(speed, 'forward-back');
                },
                enabled: true
            }
        };

        for (var i = 0, len = items.length; i < len; i++) {
            item = items[i];
            navbar.push(hash[item]);
        }

        if (navbar.length > 0) {
            this.navbar = navbar;
        } else {
            this.navbar = false;
        }
    };

    ParanomaRoaming.prototype.initViewer = function () {
        this.viewer = new PhotoSphereViewer({
            // loading_img: 'photosphere-logo.gif',
            // caption: 'Bryce Canyon National Park <b>&copy; Mark Doliner</b>',
            // [-Math.PI,Math.PI]
            // longitude_range: [-7 * Math.PI / 8, 7 * Math.PI / 8],
            // [π/2, -π/2]
            // latitude_range: [-3 * Math.PI / 4, 3 * Math.PI / 4],
            panorama: '',
            container: this.container,
            autoload: false,
            loading_img: null,
            loading_txt: null,
            navbar: this.navbar,
            anim_speed: '-2rpm',
            default_fov: 50,
            fisheye: true,
            move_speed: 1.1,
            time_anim: false,
            gyroscope: true,
            webgl: true,
            transition: {
                duration: 1000,
                loader: true,
                blur: true
            },
            'cache_texture': this['cache_texture'],
            mousewheel: false,
            mousemove: false,
            keyboard: false
        });
    };

    ParanomaRoaming.prototype.showLoading = function () {
        var loading = '<div class="paranoma-roaming-preload"> ' +
            '<div class="paranoma-roaming-preload-logo' + (this.loadingVideo ? '-hidden' : '') + '"> </div>' +
            ' </div>';
        $(loading).appendTo('body');
    };

    ParanomaRoaming.prototype.closeLoading = function () {
        $('.paranoma-roaming-preload').remove();
    };

    ParanomaRoaming.prototype.showSubTitles = function () {
        var picture = this.pictures.list[this.pictures.index],
            subTitles = picture.subTitles,
            self = this;

        if (!subTitles || this.lastSubTitles.length !== subTitles.length) {
            self.removeSubTitles();
        }

        if (subTitles && subTitles instanceof Array) {
            subTitles.forEach(function (subTitle, index) {
                var lastSubTitle,
                    img = null;

                lastSubTitle = self.lastSubTitles[index];
                if (lastSubTitle && lastSubTitle.url === subTitle.url) {
                    return;
                }
                img = lastSubTitle ? lastSubTitle.elem : null;

                self.showSubTitle(img, subTitle);
            });
        }
    }

    ParanomaRoaming.prototype.showSubTitle = function (img, opt) {
        if (!img) {
            img = $('<img src="' + opt.url + '"/>').css({
                position: 'absolute',
                left: opt.left,
                bottom: opt.bottom,
                right: opt.right,
                top: opt.top
            });

            $('#' + this.container).append(img);
            this.lastSubTitles.push({
                elem: img,
                url: opt.url
            });
        } else {
            img.attr('src', opt.url).css({
                left: opt.left,
                bottom: opt.bottom,
                right: opt.right,
                top: opt.top
            });
        }
    }

    ParanomaRoaming.prototype.removeSubTitles = function () {
        if (this.lastSubTitles.length > 0) {
            this.lastSubTitles.forEach(function (subTitle) {
                subTitle.elem.remove();
            });
            this.lastSubTitles = [];
        }
    }

    ParanomaRoaming.prototype.getPreloadPanoramasInfo = function () {
        var pictures = this.pictures.list,
            cache = this.cache,
            index = this.pictures.index,
            pictureLength = pictures.length,
            pr = this,
            start = 0,
            end = 0;

        if (cache.finish) {
            return null;
        }

        if (cache.first) {
            cache.first = false;
            start = cache.current;
            end = cache.next;
            cache.current = cache.current + cache.count;
            cache.next = cache.current + cache.count;

            if (end >= pictureLength) {
                end = pictureLength;
                cache.finish = true;
            }
        } else if (index >= cache.current && index < cache.next) {
            start = cache.next;
            end = cache.next + cache.count;

            cache.current = cache.next;
            cache.next = cache.next + cache.count;

            if (end >= pictureLength) {
                end = pictureLength;
                cache.current = 0;
                cache.next = 2 * cache.count;
                cache.first = true;
                if (pictureLength < 3 * cache.count) {
                    cache.finish = true;
                }
            }
        }

        return {
            pictures: pictures,
            relativeUrl: pr.relativeUrl,
            start: start,
            end: end
        };
    };

    // 预加载图片:首次加载使用
    ParanomaRoaming.prototype.preloadPanoramasInIframe = function () {
        var list = ['preload'],
            contentWindow = this.preloadWindow,
            preloadInfo;

        preloadInfo = this.getPreloadPanoramasInfo();

        if (preloadInfo) {
            list = list.concat(contentWindow.loadPictures(preloadInfo.pictures, preloadInfo.relativeUrl, preloadInfo.start, preloadInfo.end));
        }

        return Promise.all(list);
    };

    // 预加载图片:动画过程中使用
    ParanomaRoaming.prototype.preloadPanoramasInWebWorker = function () {
        var worker = this.preloadWorker,
            preloadInfo;

        preloadInfo = this.getPreloadPanoramasInfo();

        if (preloadInfo && preloadInfo.start < preloadInfo.end) {
            worker.postMessage(preloadInfo);
        }
    };

    ParanomaRoaming.prototype.playAudio = function () {
        var picture = this.pictures.list[this.pictures.index],
            url = this.relativeUrl + picture.audio,
            audio = this.audio;

        if (url !== undefined && url !== this.lastAudio && picture.audio) {
            audio.autoplay = true;
            audio.src = url;
            this.lastAudio = url;
        }
    };

    ParanomaRoaming.prototype.playBgAudio = function () {
        var url = this.relativeUrl + this.bgAudioUrl,
            audio = this.bgAudio;

        if (!this.bgAudioUrl) {
            console.warn('bgAudioUrl is null!');
            return;
        }

        if (!audio.paused) {
            return;
        }

        if (url !== undefined) {
            audio.autoplay = true;
            audio.loop = true;
            audio.volume = this.bgAudioVolume;
            audio.src = url;
            this.lastAudio = url;
        }
    };

    ParanomaRoaming.prototype.preloadPanoramaList = function (start, end) {
        var list = [],
            i,
            pictures = this.pictures.list,
            viewer = this.viewer,
            picture;

        for (i = start; i < end; i++) {
            picture = pictures[i];
            list.push(viewer.preloadPanorama(picture.url));
        }
        // console.log('loadall-' + this.pictures.index + ':' + start + ',' + end);

        return list;
    };

    ParanomaRoaming.prototype.preloadPanoramasInTexture = function (start, end) {
        var list = [],
            i,
            pictures = this.pictures.list,
            viewer = this.viewer,
            texture = this.cache.texture,
            picture;

        // 不缓存材质
        if (this['cache_texture'].length < 1) {
            return Promise.all(['null']);
        }

        for (i = start; i < end; i++) {
            picture = pictures[i];
            list.push(viewer.preloadPanorama(picture.url));
            // 记录
            if (texture.length === this['cache_texture']) {
                texture.shift();
            }
            texture.push(i);
            console.log(texture.toString());
        }
        console.log('loadall-' + this.pictures.index + ':' + start + ',' + end);

        return Promise.all(list);
    };

    ParanomaRoaming.prototype.preloadNextPictureTexture = function () {
        var cache = this.cache.texture,
            frameNumber = this.frameNumber,
            pictureIndex,
            count = this['cache_texture'] / 4,
            // nextIndex,
            info,
            // promise,
            pr = this;

        if (count < 1) {
            return;
        }

        function preload() {
            var promise = null;
            info = pr.getNextFrameInfo(frameNumber);
            pictureIndex = info.pictureIndex;
            frameNumber = info.frameNumber;
            --count;
            if (cache.indexOf(pictureIndex) === -1) {
                // 预加载序号为pictureIndex的图片材质
                promise = pr.preloadPanoramasInTexture(pictureIndex, pictureIndex + 1);
            }

            if (count > 0) {
                if (promise) {
                    promise.then(function () {
                        preload();
                    });
                } else {
                    preload();
                }
            }
        }

        preload();
    };

    ParanomaRoaming.prototype.render = function () {
        var url,
            name,
            viewer = this.viewer,
            promise,
            pr = this,
            moveToLongitude = this.moveToLocation.longitude,
            moveToLatitude = this.moveToLocation.latitude,
            picture;

        // console.log('moveToLongitude:' + moveToLongitude);
        // console.log('moveToLatitude:' + moveToLatitude);

        pr.preloadNextPictureTexture();
        picture = pr.getNextPicture();
        url = picture.url;
        name = picture.name;

        if (pr.left) {
            pr.longitude -= pr.longitudeOffset;
            if (moveToLongitude !== null) {
                if (pr.longitude <= moveToLongitude) {
                    pr.longitude = moveToLongitude;
                }
            }
        } else if (pr.right) {
            pr.longitude += pr.longitudeOffset;
            if (moveToLongitude !== null) {
                if (pr.longitude >= moveToLongitude) {
                    pr.longitude = moveToLongitude;
                }
            }
        }

        if (pr.up) {
            pr.latitude += pr.latitudeOffset;
            if (moveToLatitude !== null) {
                if (pr.latitude >= moveToLatitude) {
                    pr.latitude = moveToLatitude;
                }
            }
        } else if (pr.down) {
            pr.latitude -= pr.latitudeOffset;
            if (moveToLatitude !== null) {
                if (pr.latitude <= moveToLatitude) {
                    pr.latitude = moveToLatitude;
                }
            }
        }

        // console.log('logitude:' + pr.longitude + ' latitude:' + pr.latitude);

        // 图片相同，不再次渲染
        if (pr.pictures.lastPicture === url) {
            promise = new Promise(function (resolve, reject) {
                viewer.rotate({
                    longitude: pr.longitude,
                    latitude: pr.latitude
                });
                resolve();
            });
        } else {
            promise = new Promise(function (resolve, reject) {
                viewer.setPanorama(url, {
                    longitude: pr.longitude,
                    latitude: pr.latitude
                }, false).then(function () {
                    pr.pictures.lastPicture = url;
                    if (viewer.setCaption) {
                        viewer.setCaption(name);
                    }
                    resolve();
                });
            });
        }

        return promise;
    };

    ParanomaRoaming.prototype.reanderAnimation = function () {
        var promise,
            pr = this;

        // 预加载
        this.preloadPanoramasInWebWorker();
        promise = this.render();
        this.playAudio();
        this.showSubTitles();
        if (this.state === 'play') {
            promise.then(function () {
                requestAnimationFrame(function () {
                    pr.reanderAnimation.call(pr);
                });
            });
        }
    };

    ParanomaRoaming.prototype.play = function () {
        if (this.state !== this.stateType.play) {
            this.state = this.stateType.play;
            this.reanderAnimation();
            this.video.pause();
            this.videoContainer.addClass('pr-iframe-video-hidden');
        }
    };

    ParanomaRoaming.prototype.pause = function () {
        this.state = this.stateType.pause;
    };

    ParanomaRoaming.prototype.moveLeft = function () {
        this.left = true;
        this.right = false;
        this.longitudeOffset = this.longitudeOffset <= 0 ? this.longitudeDatum : this.longitudeOffset;
        this.resetMoveToLocation(true, false);
    };

    ParanomaRoaming.prototype.moveRight = function () {
        this.right = true;
        this.left = false;
        this.longitudeOffset = this.longitudeOffset <= 0 ? this.longitudeDatum : this.longitudeOffset;

        this.resetMoveToLocation(true, false);
    };

    ParanomaRoaming.prototype.moveUp = function () {
        this.up = true;
        this.down = false;
        this.latitudeOffset = this.latitudeOffset <= 0 ? this.latitudeDatum : this.latitudeOffset;

        this.resetMoveToLocation(false, true);
    };

    ParanomaRoaming.prototype.moveDown = function () {
        this.down = true;
        this.up = false;
        this.latitudeOffset = this.latitudeOffset <= 0 ? this.latitudeDatum : this.latitudeOffset;

        this.resetMoveToLocation(false, true);
    };

    ParanomaRoaming.prototype.moveForward = function () {
        this.forward = true;
        this.back = false;
        this.frameNumberOffset = this.frameNumberOffset <= 0 ? this.frameDatum : this.frameNumberOffset;
    };

    ParanomaRoaming.prototype.moveBack = function () {
        this.forward = false;
        this.back = true;
        this.frameNumberOffset = this.frameNumberOffset <= 0 ? this.frameDatum : this.frameNumberOffset;
    };

    ParanomaRoaming.prototype.moveTo = function (longitude, latitude) {
        if (longitude !== null) {
            if (longitude < this.longitude) {
                this.moveLeft();
            } else if (longitude > this.longitude) {
                this.moveRight();
            }

            this.moveToLocation.longitude = longitude;
        }

        if (latitude !== null) {
            if (latitude < this.latitude) {
                this.moveDown();
            } else if (latitude > this.latitude) {
                this.moveUp();
            }

            this.moveToLocation.latitude = latitude;
        }
    };

    ParanomaRoaming.prototype.resetMoveToLocation = function (longitude, latitude) {
        if (longitude) {
            this.moveToLocation.longitude = null;
        } else if (latitude) {
            this.moveToLocation.latitude = null;
        }
    };

    ParanomaRoaming.prototype.setSpeed = function (speed, direction) {
        var pr = this;

        speed = Math.abs(speed);

        if (direction === 'left-right') {
            pr.longitudeOffset = speed * pr.longitudeDatum;
        } else if (direction === 'up-down') {
            pr.latitudeOffset = speed * pr.latitudeDatum;
        } else if (direction === 'forward-back') {
            pr.frameNumberOffset = speed * pr.frameDatum;
        }
    };

    ParanomaRoaming.prototype.getNextFrameInfo = function (currentFrameNumber) {
        var pictureIndex = 0,
            frameNumber = currentFrameNumber,
            pictureCount = this.pictures.count;

        if (this.forward) {
            frameNumber += this.frameNumberOffset;
        } else if (this.back) {
            frameNumber -= this.frameNumberOffset;
        }

        pictureIndex = Math.floor(frameNumber);

        if (pictureIndex > pictureCount - 1) {
            pictureIndex = 0;
            frameNumber = pictureIndex;
        } else if (pictureIndex < 0) {
            pictureIndex = pictureCount - 1;
            frameNumber = pictureIndex;
        }

        return {
            frameNumber: frameNumber,
            pictureIndex: pictureIndex
        };
    };

    ParanomaRoaming.prototype.getNextPicture = function () {
        var pictureIndex = 0,
            frameNumber = this.frameNumber,
            info;

        info = this.getNextFrameInfo(frameNumber);

        pictureIndex = info.pictureIndex;
        frameNumber = info.frameNumber;

        this.frameNumber = frameNumber;
        this.pictures.index = pictureIndex;

        return this.pictures.list[pictureIndex];
    };

    window.ParanomaRoaming = ParanomaRoaming;
}(PhotoSphereViewer, jQuery, window));