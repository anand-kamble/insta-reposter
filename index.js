const Instagram = require('instagram-web-api');
const prompt = require('prompt-sync')();
const request = require('request')
var Jimp = require('jimp');
const fs = require('fs');

async function main1 (){
    var UserName , Password , accounttocp ,time ,accounts;
var input = process.argv;
if(input.length == 5){
    UserName = input[2];
    Password = input[3];
    accounttocp = input[4];
    time = input[5]
}else{
    UserName = prompt('Enter the Username without @ : ');
    Password = prompt('Enter the Password for account '+UserName+' : ' );
    accounttocp = prompt('Enter the usernames of accounts to repost from sepereated by comma : ');
    time = prompt('Enter the time interval between two posts in seconds : ');
}
if(accounttocp.includes(',')){
    accounts = accounttocp.split(',');
}else{
    accounts = [accounttocp];
}
    var client = new Instagram({ username: UserName, password: Password }, { language: 'en-US' });
    const { username, password, cookies } = await client.login({ username: UserName, password: Password })
    const { authenticated, user } = await client.login({ username: UserName, password: Password })
    console.log('Logged in')
    var i = 0 ;
setInterval (async function () {
    var posted = require('./History.json');
    if(i<accounts.length-1){i++}
    else{i=0};
    var photo =  await client.getPhotosByUsername({ username: accounts[i] })
    console.log("\nChecking "+ accounts[i])
    var url = await photo.user.edge_owner_to_timeline_media.edges[0].node.display_resources[2].src;
    if(posted.includes(url)){console.log("nothing new found")}
    else{
        await posted.push(url);
        fs.writeFile('History.json' , JSON.stringify(posted) , function(){
            console.log('History Updated')
        })
    if (photo.user.edge_owner_to_timeline_media.edges[0].node.is_video == true){console.log("It's a video , can't be uploaded.")}
    else{
        let font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        console.log('Font loaded')
        let image = await Jimp.read(url);
        console.log('image loaded')
        image = image.print(font, 50, 50, '@'+username);
        console.log('Edited');
        var d = new Date()
        var t = d.getHours();
        var m = d.getMinutes();
        var s = d.getSeconds();
        await image.writeAsync('post_'+accounts[i]+'_'+t+'.jpg');
        var discription = '';
        var forcation = '\n';
        if(photo.user.edge_owner_to_timeline_media.edges[0].node.edge_media_to_caption.edges[0] === undefined){
            discription = '❤️\n.\n.\n'+forcation+'\nnOriginally posted by : @'+ accounts[i];            
        }
        else{              
            var cap = photo.user.edge_owner_to_timeline_media.edges[0].node.edge_media_to_caption.edges[0].node.text;
            if(cap.length>2200){discription = 'Follow for more...\n\n'+forcation+'\n\nOriginally posted by '+account[i];}
            else{ discription = cap + '\n.\n.'+forcation+'\n\nnOriginally posted by : @'+ accounts[i];}
        }; 
        console.log('starting upload')
        await client.uploadPhoto({ photo:'post_'+accounts[i]+'_'+t+'.jpg' , caption: discription , post:'feed' });
        console.log('Uploaded')

        let background = await Jimp.read('background.png')
        var w = image.bitmap.width; 
        var h = image.bitmap.height;
        image.resize(1080,Jimp.AUTO);
        var imageposition = 960-(h/2);
        background.composite(image, 0, imageposition , {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 1,
            opacityDest: 1
        });
        await background.writeAsync('story_.jpg');
        console.log('Starting story Upload')
        await client.uploadPhoto({ photo:'story_.jpg' , caption: discription , post:'story' });
        console.log('Uploaded to story')
        console.log("\x1b[0m")
    }
}
},time*1000);
}
main1()