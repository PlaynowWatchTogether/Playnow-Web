import Service from '@ember/service';

export default Service.extend({
  init(){
    this._super(...arguments);
    this.supportTopics = {
      "account":{
        id: "account",
        title: "My Account & Settings",
        color: 'color1',
        items1:[
          {
            title:"Creating a Playnows Account",
            text:"There are 3 required information to make a Playnows account.\
            <ul>\
            <li>\
Full name: This information is required to make it easier for you and your friends to identify each other when you add them as a friend.\
</li><li>\
Birthday & Age: Your birthday and age is recorded to make sure that you are old enough to use Playnows. You cannot use Playnows if you are younger than 13.\
</li><li>\
Username & Password: This one is quite obvious. We need it to make you your own unique account that only you can sign in to.</li></ul>"
},

          {
            title: "Blocking Certain Users",
            text:"We understand that there may be users that you do not want to deal with. So we have a feature that blocks users. <br>\
          1. Click on the chat of the person who you want to block.<br>\
          2. Click on the username of the person at the top, and you will see a pop-up.<br>\
          3. Click \"block\" on the top right of the pop-up<br>\
          You can always unblock the person in your settings."
          },
        ],
        items2:[
          {
            title:"Changing Profile Picture",
            text: "Your default profile picture is initially set as one of the most famous art masterpiece: Mona Lisa. To change it to your unique picture, just click on the Mona Lisa on the top left of your friends list to open your profile page. Then click on the Mona Lisa again.<br><br> \
          You must allow Playnows to access your photos in order to change your profile picture and send pictures to your friends."
          },
          {
            title:"Clean Video Search",
            text: "Playnows utilizes Youtube videos and we do not necessarily have control over the contents, although we can manually remove certain contents on Playnows only.\
                   To block explicit videos, just enable the \"Clean Video Search Results\" in your settings. And watch together anywhere!"
          }
        ]
      },
      "policies":{
        id:"policies",
        title: "Policies & Copyright",
        color: 'color2',
        items1:[
          {
            title: "Account Suspension",
            text: "Playnows does not allow users that gives harm to our community. And thus those users may be penalized with an account suspension.<br>\
            If you receive an \“Access Suspended for This Account\” notification and believe it’s a mistake, please email your username along with any relevant information regarding the usage of the account in question to <a href=\"mailto: andrew.jang@playnowmessenger.com\">andrew@playnows.com</a>. We will unlock your account manually once the information provided has been verified by our team."
          },
          {
            title: "Terms of Use",
            text: "Information about Playnows' Terms of Use can be found <a href=\"/help/terms\">here</a>."
          }
        ],
        items2:[
          {
            title: "Report Video Content",
            text: "Playnows utilizes Youtube videos and we do not necessarily have control over the contents, although we can manually remove certain contents on Playnows only.<br>\
            However, we can manually remove videos that are harmful to our users. You can report a video by click on the top left Exclamation mark button. Our team will investigate into reported videos."
          },
          {
            title: "Copyright",
            text:"Information about Playnows' copyright policy can be found <a href=\"/help/copyright\">here</a>."
          }
        ]
      },
      "using":{
        id: "using",
        title: "Using Playnows",
        color: 'color3',
        items1:[
          {
            title: "Watch Videos Together",
            text: [
              "Playnows is all about doing stuff together, anywhere and anytime! So we made it easy for you to watch videos together.",
              "1. Go into the chat of the person you want to watch together with.",
              "2. Tap the Treasure Chest button on the top right, or just swipe left.",
              "3. See what videos are trending or search the video you want to watch together and just select it!",
              "Enjoy!"
            ].join("<br><br>")
          },
          {
            title: "Listen to Trending songs",
            text: [
              "Do you just want to listen to songs together and chill while texting each other?",
              "You can also listen together, by pressing the \"music\" tab in the Treasure Chest. See what songs are trending or search and listen together!"
            ].join("<br><br>")
          }
        ],
        items2:[
          {
            title: "Watch Videos as a Group",
            text: [
              "Not only can you watch together, but you can also watch together up to 10 friends at the same time!",
              "1. First, create group by clicking on the button. Name the group and add friends to the group.",
              "2. On the group chat, tap the Treasure Chest or just swipe left.",
              "3. Select the video and watch together with all of your friends!"
            ].join("<br><br>")
          },
          {
            title: "Add Friends",
            text: [
              "In order to use Playnows, you need to add friends. You can add friends with their usernames. ",
              "You can see your username on your profile."
            ].join("<br><br>")
          }
        ]
      },
      "safety":{
        id: "safety",
        title: "Privacy & Safety",
        color: 'color4',
        items1:[
          {
            title: "Community Guidelines",
            text: [
              "Our team really care about the Playnows community and so we are suggesting few guidelines to all our users.",
              "Our Community Guidelines can be found <a href=\"/help/community\">here</a>."
            ].join("<br><br>")
          },
          {
            title: "Listen to Trending songs",
            text: [
              "Do you just want to listen to songs together and chill while texting each other?",
              "You can also listen together, by pressing the \"music\" tab in the Treasure Chest. See what songs are trending or search and listen together!"
            ].join("<br><br>")
          }
        ],
        items2:[
          {
            title: "Watch Videos as a Group",
            text: [
              "Not only can you watch together, but you can also watch together up to 10 friends at the same time!",
              "1. First, create group by clicking on the button. Name the group and add friends to the group.",
              "2. On the group chat, tap the Treasure Chest or just swipe left.",
              "3. Select the video and watch together with all of your friends!"
            ].join("<br><br>")
          },
          {
            title: "Add Friends",
            text: [
              "In order to use Playnows, you need to add friends. You can add friends with their usernames. ",
              "You can see your username on your profile."
            ].join("<br><br>")
          }
        ]
      }
    }
  },
  topics(){
    return Object.values(this.supportTopics);
  },
  topic(id){
    return this.supportTopics[id];
  }
});
