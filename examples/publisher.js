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

const joinmyclassButton = document.getElementById("publishTeacher");
const startPublishingTeacherStream = () => {
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
joinmyclassButton.addEventListener('click', () => {
    startPublishingTeacherStream();
    var T = document.getElementById("media-screen");
    T.style.display = "flex";
    
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

    // const streamTransmit=(stream)=>{
    //     try {
    //         console.log("pub" +stream)
    //         var divStream = document.getElementById("stream-publisher");
    //         var video = document.createElement("my_video");
    //         video.srcObject = stream;
    //         divStream.appendChild(video);
    //         video.play();
    //     } catch (err) {
    //         console.log('error :: ' + err)
    //     }
    // }
    

    const establishSharedObject = (publisher) => {
        so = new SharedObject('sharedObjectTest', publisher)
        const soCallback = {
            messageTransmit: messageTransmit
        };
        // const soCallbackVideoStream={
        //     streamTransmit: streamTransmit
        // };

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
            // console.log(JSON.stringify(event.data, null, 2));
        });

        so.on(red5prosdk.SharedObjectEventTypes.METHOD_UPDATE, (event) => {
            console.log('[Red5ProPublisher] SharedObject Method Update.');
            console.log(JSON.stringify(event.data, null, 2));
            soCallback[event.data.methodName].call(null, event.data.message);
            // soCallbackVideoStream[event.data.methodName].call( event.data.stream);
        });
    }
    // var hasRegistered=false;
    // function establishSharedObject (publisher, roomName, streamName) {
    //     // Create new shared object.
    //     so = new SharedObject(roomName, publisher)
    //     so.on(red5prosdk.SharedObjectEventTypes.CONNECT_SUCCESS, function (event) { // eslint-disable-line no-unused-vars
    //       console.log('[Red5ProPublisher] SharedObject Connect.');
    //       console.log('Connected.');
    //     });
    //     so.on(red5prosdk.SharedObjectEventTypes.CONNECT_FAILURE, function (event) { // eslint-disable-line no-unused-vars
    //       console.log('[Red5ProPublisher] SharedObject Fail.');
    //     });
    //     so.on(red5prosdk.SharedObjectEventTypes.PROPERTY_UPDATE, function (event) {
    //       console.log('[Red5ProPublisher] SharedObject Property Update.');
    //       console.log(JSON.stringify(event.data, null, 2));
    //       if (event.data.hasOwnProperty('streams')) {
    //         console.log('Stream list is: ' + event.data.streams + '.');
    //         var streams = event.data.streams.length > 0 ? event.data.streams.split(',') : [];
    //         if (!hasRegistered) {
    //           hasRegistered = true;
    //           so.setProperty('streams', streams.concat([streamName]).join(','));
    //         }
    //         streamsPropertyList = streams;
    //         processStreams(streamsPropertyList, streamName);
    //       }
    //       else if (!hasRegistered) {
    //         hasRegistered = true;
    //         streamsPropertyList = [streamName];
    //         so.setProperty('streams', streamName);
    //       }
    //     });
    //   }

    //   function processStreams (streamlist, exclusion) {
    //     var nonPublishers = streamlist.filter(function (name) {
    //       return name !== exclusion;
    //     });
    //     var list = nonPublishers.filter(function (name, index, self) {
    //       return (index == self.indexOf(name)) &&
    //         !document.getElementById(window.getConferenceSubscriberElementId(name));
    //     });
    //     var subscribers = list.map(function (name, index) {
    //       return new window.ConferenceSubscriberItem(name, subscribersEl, index);
    //     });
    //     var i, length = subscribers.length - 1;
    //     var sub;
    //     for(i = 0; i < length; i++) {
    //       sub = subscribers[i];
    //       sub.next = subscribers[sub.index+1];
    //     }
    //     if (subscribers.length > 0) {
    //       var baseSubscriberConfig = Object.assign({},
    //                                   configuration,
    //                                   {
    //                                     protocol: getSocketLocationFromProtocol().protocol,
    //                                     port: getSocketLocationFromProtocol().port
    //                                   },
    //                                   getAuthenticationParams(),
    //                                   getUserMediaConfiguration());
    //       subscribers[0].execute(baseSubscriberConfig);
    //     }
    //   }


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

    //start subscribing from here:









    const subscriber = new red5prosdk.RTCSubscriber();
    var video = document.createElement("video");
    video.id="red5pro-subscriber"+Math.random().toString(16).slice(2);
 
    const SubscriberConfiguration = {
        protocol: "wss",
        port: 443,
        host: "red5stream.searceinc.org",
        // protocol: 'ws',
        // port: 5080,
        // host: 'localhost',
        app: 'live',
        streamName: "mystream2",
        rtcConfiguration: {
            iceServers: [{urls: 'stun:stun2.l.google.com:19302'}],
            iceCandidatePoolSize: 2,
            bundlePolicy: 'max-bundle'
        },
        mediaElementId: video.id,
        publishingId: 'mystream2' + Math.floor(Math.random() * 0x10000).toString(16),
        videoEncoding: 'NONE',
        audioEncoding: 'NONE',
        rtcpMuxPolicy: 'negotiate',
        }

       // Initialize
const showStudentButton = document.getElementById("subscribeStudents");
const startSubscribingStudentStream = () => {
    subscriber.init(SubscriberConfiguration).then(() => {
        console.log('LOG :: Subscribe Init Done')
        subscriber.subscribe();
    
    }).then(() => {
        console.log('LOG :: Subscribe Done')
    }).catch((error) => {
        console.log('ERROR :: ' + error);
    });
}
showStudentButton.addEventListener('click', () => {

    var divStream = document.getElementById("media-screen");
    var div = document.createElement('div');
    div.className="stream";
  
    video.setAttribute("autoplay",true);
    video.setAttribute("controls",true);
    video.setAttribute("muted",true);
    video.setAttribute("class","red5pro-media");
    video.setAttribute("class","red5pro-media-background");
    div.append(video);
    divStream.append(div);

    startSubscribingStudentStream();
    var T = document.getElementById("media-screen");
    T.style.display = "flex";

});











  
    
})(window.red5prosdk);
