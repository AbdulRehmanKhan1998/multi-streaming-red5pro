((red5prosdk) => {

    const publisher = new red5prosdk.RTCPublisher();
    const sendButton = document.getElementById('send');
    const SharedObject = red5prosdk.Red5ProSharedObject;
    
    
   

    const configuration = {
        // protocol: "ws",
        // port: 5080,
        // host: "localhost",
        protocol: "wss",
        port: 443,
        host: "red5stream.searceinc.org",
        app: "live",
        streamName1: 'mystream1',
        streamName2: 'mystream2',
        rtcConfiguration: {
            iceServers: [{urls: "stun:stun2.l.google.com:19302"}],
            iceCandidatePoolSize: 2,
            bundlePolicy: "max-bundle",
        },
        streamMode: "live",
        mediaElementId: "red5pro-publisher",
        bandwidth: {
            audio: 56,
            video: 512,
        },
        mediaConstraints: {
            audio: true,
            video: {
                width: {
                    exact: 640,
                },
                height: {
                    exact: 480,
                },
                frameRate: {
                    min: 8,
                    max: 24,
                },
            },
        },
    }

    publisher.init(configuration).then(() => {
        console.log('LOG :: Publish Init Done');
        publisher.publish();
    }).then(() => {
        console.log('LOG :: Publish Done');
        establishSharedObject(publisher);
    }).catch((error) => {
        console.log('ERROR :: ' + error);
    });

    

    const messageTransmit = (message) => {
        var div = document.getElementById("messages");
        var input = document.createElement("textarea");
        input.id = "so-field" + Math.random().toString(16).slice(2)
        input.setAttribute('enabled', true);
        div.appendChild(input);
        const soField = document.getElementById(input.id);
        soField.value = ['User "' + message.user + '": ' + message.message];
    }
    

    const establishSharedObject = (publisher) => {
        so = new SharedObject('sharedObjectTest', publisher)
        const soCallback = {
            messageTransmit: messageTransmit
        };

        so.on(red5prosdk.SharedObjectEventTypes.CONNECT_SUCCESS, (event) => {
            console.log('[Red5ProPublisher] SharedObject Connect.');
            window.alert("connected")
        });

        so.on(red5prosdk.SharedObjectEventTypes.CONNECT_FAILURE, (event) => {
            console.log('[Red5ProPublisher] SharedObject Fail.');
        });

        so.on(red5prosdk.SharedObjectEventTypes.PROPERTY_UPDATE, (event) => {
            console.log('[Red5ProPublisher] SharedObject Property Update.');
            console.log(JSON.stringify(event.data, null, 2));
        });

        so.on(red5prosdk.SharedObjectEventTypes.METHOD_UPDATE, (event) => {
            console.log('[Red5ProPublisher] SharedObject Method Update.');
            console.log(JSON.stringify(event.data, null, 2));
            soCallback[event.data.methodName].call(null, event.data.message);
        });
    }

    sendButton.addEventListener('click', () => {
        const message = document.getElementById('text-area').value;
        if (message != undefined) {
            console.log("from send button event listener", message);
            so.send('messageTransmit', {
                user: "Teacher",
                message: message
            })
        }
    });
    // var captureButton = document.getElementById('capture-button');
    // const videoTag = document.getElementById('red5pro-publisher');

    // async function capture (cb) {
    //     captureButton.disabled = true;
    //     var config = {
    //         audio: true,
    //         video:true,
    //         video: {
    //           width: 640, //{ maxWidth: vw },
    //           height: 480, //{ maxHeight: vh },
    //           frameRate: 20//{ maxFrameRate: fr }
    //         }
    //     };
    //     console.log("before")
    //     console.log('Using Capture Configuration:\r\n' + JSON.stringify(config, null, 2));
    //     // Edge has getDisplayMedia on navigator and not media devices?
    //     var p = undefined
    //     if (navigator.getDisplayMedia) {
    //       p = await navigator.getDisplayMedia(config)
    //     } else {
    //       p = await navigator.mediaDevices.getDisplayMedia(config)
    //     }
    //     console.log(p)
    //     console.log("after")
        
    //     return p
    //   }

    // captureButton.addEventListener('click', function() {
        
    //     p=capture(publisher);
    //     videoTag.srcObject = p.id;
    //     videoTag.onloadedmetadata = function(e) {
    //     videoTag.play();
    //     };
    //   });
    // console.log(subscriber.getPeerConnection())
})(window.red5prosdk);
