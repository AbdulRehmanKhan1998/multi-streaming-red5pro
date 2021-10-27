((red5prosdk) => {
    const subscriber = new red5prosdk.RTCSubscriber();
    const SharedObject = red5prosdk.Red5ProSharedObject;
    const sendButton = document.getElementById('send');
    var so=undefined;

    //generate random streamNameId
    function generateStreamName(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }
       return result;
    }
    const streamNameTemp=generateStreamName(5);
    
    const configuration = {
        protocol: "wss",
        port: 443,
        host: "red5stream.searceinc.org",
        // protocol: 'ws',
        // port: 5080,
        // host: 'localhost',
        app: 'live',
        streamName: "mystream",
        rtcConfiguration: {
            iceServers: [{urls: 'stun:stun2.l.google.com:19302'}],
            iceCandidatePoolSize: 2,
            bundlePolicy: 'max-bundle'
        },
        mediaElementId: 'red5pro-subscriber',
        subscriptionId: 'mystream' + Math.floor(Math.random() * 0x10000).toString(16),
        videoEncoding: 'NONE',
        audioEncoding: 'NONE',
        rtcpMuxPolicy: 'negotiate',
        }



    // Initialize
    const showTeacherButton = document.getElementById("subscribeTeacher");
    const startSubscribingTeacherStream = () => {
        subscriber.init(configuration).then(() => {
            console.log('LOG :: Subscribe Init Done')
            subscriber.subscribe();
        
        }).then(() => {
            console.log('LOG :: Subscribe Done')
            establishSharedObject(subscriber);
        }).catch((error) => {
            console.log('ERROR :: ' + error);
        });
    }
    showTeacherButton.addEventListener('click', () => {
        startSubscribingTeacherStream();
        var showStream = document.getElementById("media-screen");
        showStream.style.display = "flex";
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
    const testTransmit = (message) => {
        console.log(message)
    }
    const establishSharedObject = (subscriber) => {
        try {
            so = new SharedObject('sharedObjectTest', subscriber);
        } catch (err) {
            console.log('error :: ' + err)
        }

        const soCallback = {
            messageTransmit: messageTransmit,
            testTransmit:testTransmit
        };
        
        so.on(red5prosdk.SharedObjectEventTypes.CONNECT_SUCCESS, (event) => {
            console.log('[Red5ProSubscriber] SharedObject Connect.');
            window.alert("connected"); 
        });
       
        so.on(red5prosdk.SharedObjectEventTypes.CONNECT_FAILURE, (event) => {
            console.log('[Red5ProSubscriber] SharedObject Fail.');
        });
        so.on(red5prosdk.SharedObjectEventTypes.CONNECTION_CLOSED, (event) => {
            console.log('[Red5ProSubscriber] SharedObject connection closed.');
        });
        
        so.on(red5prosdk.SharedObjectEventTypes.PROPERTY_UPDATE, (event) => {
            console.log('[Red5ProPublisher] SharedObject Property Update.');
    });

        so.on(red5prosdk.SharedObjectEventTypes.METHOD_UPDATE, function (event) {
            console.log('[Red5ProPublisher] SharedObject Method Update.');
            console.log(JSON.stringify(event.data, null, 2));
            soCallback[event.data.methodName].call(null, event.data.message);
        
        });
    };

    

    sendButton.addEventListener('click', function () {
        let message = document.getElementById('text-area').value.replace('\n','<br>');
        if (message != undefined) {
            console.log("LOG :: message :: "+message);
            so.send('messageTransmit', {
                user: configuration.subscriptionId,
                message: message
            });
        }
    });
    

    //start publishing from here:
    const publisher = new red5prosdk.RTCPublisher();
    const joinMyClassButton = document.getElementById("publishStudent");

    joinMyClassButton.addEventListener('click', () => {

        var video = document.createElement("video");
        video.id="red5pro-publisher"+Math.random().toString(16).slice(2);
        const configurationPublisher = {
            // protocol: "ws",
            // port: 5080,
            // host: "localhost",
            protocol: "wss",
            port: 443,
            host: "red5stream.searceinc.org",
            app: "live",
            streamName: "mystream2",
            rtcConfiguration: {
                iceServers: [{urls: "stun:stun2.l.google.com:19302"}],
                iceCandidatePoolSize: 2,
                bundlePolicy: "max-bundle",
            },
            streamMode: "live",
            mediaElementId: video.id,
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
        configurationPublisher["streamName"]=streamNameTemp;

        var divStream = document.getElementById("media-screen");
        var div = document.createElement('div');
        div.className="stream";
        video.setAttribute("autoplay",true);
        video.setAttribute("controls",true);
        video.setAttribute("muted",false);
        video.setAttribute("class","red5pro-media");
        video.setAttribute("class","red5pro-media-background");
        div.append(video);
        divStream.append(div);

        publisher.init(configurationPublisher).then(() => {
            console.log('LOG :: Publish Init Done');
            publisher.publish();
            console.log("LOG :: newStreamName :: " + configurationPublisher.streamName);
        }).then(() => {
            console.log('LOG :: Publish Done');
            generateStream() ;
        }).catch((error) => {
            console.log('ERROR :: ' + error);
        });
        // startPublishingStudentStream();
        var showStream = document.getElementById("media-screen");
        showStream.style.display = "flex";
            
    });

    function generateStream () {
        let message = streamNameTemp;
        if (message != undefined) {
            so.send('testTransmit', {
                user: configuration.subscriptionId,
                message: message
            });
        }};
   

})(window.red5prosdk);
