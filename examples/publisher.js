((red5prosdk) => {
   
    const publisher = new red5prosdk.RTCPublisher();
    const sendButton = document.getElementById('send');
    const SharedObject = red5prosdk.Red5ProSharedObject;
    var newStreamName=undefined;
    var studentName=undefined;

    const configuration = {
        
        // protocol: "ws",
        // port: 5080,
        // host: "localhost",
        protocol: "wss",
        port: 443,
        host: "red5stream.searceinc.org",
        app: "live",
        streamName: "mystream",
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

const joinMyClassButton = document.getElementById("publishTeacher");
const publishTeacherStream = () => {
    publisher.init(configuration).then(() => {
        console.log('LOG :: Publish Init Done');
        publisher.publish();
        
    }).then(() => {
        console.log('LOG :: Publish Done');
        establishSharedObject(publisher);
    }).catch((error) => {
        console.log('ERROR :: ' + error);
    });
}
joinMyClassButton.addEventListener('click', () => {
    publishTeacherStream();
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
        newStreamName=message.message;
        studentName=message.user;
        console.log("LOG :: newStreamName :: "+newStreamName);
    }

    const establishSharedObject = (publisher) => {
        so = new SharedObject('sharedObjectTest', publisher)
        const soCallback = {
            messageTransmit: messageTransmit,
            testTransmit:testTransmit
        };

        so.on(red5prosdk.SharedObjectEventTypes.CONNECT_SUCCESS, (event) => {
            console.log('[Red5ProPublisher] SharedObject Connect.');
            window.alert("connected")
        });

        so.on(red5prosdk.SharedObjectEventTypes.CONNECT_FAILURE, (event) => {
            console.log('[Red5ProPublisher] SharedObject Fail.');
        });
        so.on(red5prosdk.SharedObjectEventTypes.CONNECTION_CLOSED, (event) => {
            console.log('[Red5ProPublisher] SharedObject connection closed.');
        });
        so.on(red5prosdk.SharedObjectEventTypes.PUBLISH_INVALID_NAME, (event) => {
            console.log('[Red5ProPublisher]'+ configuration.streamName+'provided is already in use');
        });
        
        so.on(red5prosdk.SharedObjectEventTypes.PROPERTY_UPDATE, (event) => {
            console.log('[Red5ProPublisher] SharedObject Property Update.');
        });

        so.on(red5prosdk.SharedObjectEventTypes.METHOD_UPDATE, (event) => {
            console.log('[Red5ProPublisher] SharedObject Method Update.');
            console.log(JSON.stringify(event.data, null, 2));
            soCallback[event.data.methodName].call(null, event.data.message);
        });
    }
  
    sendButton.addEventListener('click', () => {
        const message = document.getElementById('text-area').value.replace('\n','<br>');
        if (message != undefined) {
            console.log("LOG :: send button event listener, message", message);
            so.send('messageTransmit', {
                user: "Teacher",
                message: message
            })
        }
    });

    //start subscribing from here:
    // Initialize
    const showStudentButton = document.getElementById("subscribeStudents");
    showStudentButton.addEventListener('click', () => {
    var video = document.createElement("video");
    video.id="red5pro-subscriber"+studentName;
    const subscriber = new red5prosdk.RTCSubscriber();
    const SubscriberConfiguration = {
        protocol: "wss",
        port: 443,
        host: "red5stream.searceinc.org",
        // protocol: 'ws',
        // port: 5080,
        // host: 'localhost',
        app: 'live',
        streamName: newStreamName,
        rtcConfiguration: {
            iceServers: [{urls: 'stun:stun2.l.google.com:19302'}],
            iceCandidatePoolSize: 2,
            bundlePolicy: 'max-bundle'
        },
        mediaElementId: video.id,
        subscriptionId: 'mystream2' + Math.floor(Math.random() * 0x10000).toString(16),
        videoEncoding: 'NONE',
        audioEncoding: 'NONE',
        rtcpMuxPolicy: 'negotiate',
        }
        

    SubscriberConfiguration["streamName"]=newStreamName ;
    console.log(SubscriberConfiguration);
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

    subscriber.init(SubscriberConfiguration).then(() => {
        console.log('LOG :: Subscribe Init Done')
        subscriber.subscribe();
    }).then(() => {
        console.log('LOG :: Subscribe Done')
    }).catch((error) => {
        console.log('ERROR :: ' + error);
    });

    // startSubscribingStudentStream();
    var showStream = document.getElementById("media-screen");
    showStream.style.display = "flex";

});











  
    
})(window.red5prosdk);
