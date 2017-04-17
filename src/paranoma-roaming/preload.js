onmessage = function(event) {
    // 通过event.data获得发送来的数据
    var d = event.data;

    loadPicturesByTimeout(d.pictures, d.relativeUrl, d.start, d.end);

    // 将获取到的数据发送会主线程
    // postMessage(d);
};

function loadPicturesByCallback(pictures, relativeUrl, start, end) {
    var picture,
        xmlHttp,
        url,
        i = start;

    function loadPicture() {
        picture = pictures[i];
        if (picture) {
            url = relativeUrl + picture.url;
            xmlHttp = new XMLHttpRequest();

            xmlHttp.onreadystatechange = function() {
                var XMLHttpReq = xmlHttp;
                if (XMLHttpReq.readyState === 4) {
                    if (XMLHttpReq.status === 200) {
                        // console.log('success:' + i);
                        i++;
                        loadPicture();
                    }
                }
            };
            xmlHttp.open('GET', url, true);
            xmlHttp.send();
        }
    }

    // 执行load
    if (i < end) {
        loadPicture();
    }
}

function loadPicturesByTimeout(pictures, relativeUrl, start, end) {
    var picture,
        xmlHttp,
        url,
        i = start;

    function loadPicture() {
        picture = pictures[i];
        if (picture) {
            url = relativeUrl + picture.url;
            xmlHttp = new XMLHttpRequest();

            xmlHttp.open('GET', url, true);
            xmlHttp.send();
        }

        i++;
        // 执行load
        if (i < end) {
            setTimeout(function() {
                loadPicture();
            }, 160);
        }
    }

    loadPicture();
}
