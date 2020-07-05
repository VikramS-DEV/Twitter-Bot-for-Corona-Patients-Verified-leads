
// Dependencies =========================
var
    twit = require('twit'),
    config = require('./config');

var Twitter = new twit(config);
const motivationalReplies = require("./motivationalReplies");

const client = new Twitter({
  subdomain: config.subdomain,
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token,
  access_token_secret: config.access_token_secret
});

// RETWEET BOT ==========================

// find latest tweet according the query 'q' in params
var retweet = function() {
    var params = {
        q: '#covid, covid',  // REQUIRED
        result_type: 'recent',
        lang: 'en'
    }
    Twitter.get('search/tweets', params, function(err, data) {
      // if there no errors
        if (!err) {
          // grab ID of tweet to retweet
            var retweetId = data.statuses[0].id_str;
            // Tell TWITTER to retweet
            Twitter.post('statuses/retweet/:id', {
                id: retweetId
            }, function(err, response) {
                if (response) {
                    console.log('Retweeted!!!');
                }
                // if there was an error while tweeting
                if (err) {
                    console.log('Something went wrong while RETWEETING... Duplication maybe...');
                }
            });
        }
        // if unable to Search a tweet
        else {
          console.log('Something went wrong while SEARCHING...');
        }
    });
}

// grab & retweet as soon as program is running...
retweet();
// retweet in every 2 minute
setInterval(retweet, 20000);

// FAVORITE BOT====================

// find a random tweet and 'favorite' it
var favoriteTweet = function(){
  var params = {
      q: '#covid19, coronavirus',  // REQUIRED
      result_type: 'recent',
      lang: 'en'
  }
  // find the tweet
  Twitter.get('search/tweets', params, function(err,data){

    // find tweets
    var tweet = data.statuses;
    var randomTweet = ranDom(tweet);   // pick a random tweet

    // if random tweet exists
    if(typeof randomTweet != 'undefined'){
      // Tell TWITTER to 'favorite'
      Twitter.post('favorites/create', {id: randomTweet.id_str}, function(err, response){
        // if there was an error while 'favorite'
        if(err){
          console.log('CANNOT BE FAVORITE... Error');
        }
        else{
          console.log('FAVORITED... Success!!!');
        }
      });
    }
  });
}

const getReplyWithUsername = (username, reply) => {
  return reply.replace(/###/g, `@${username}`);
};


const replyToTweet = tweet => { 
  const tweet_id = tweet.id_str;
  const username = tweet.user.screen_name;
  const reply =
    motivationalReplies[Math.floor(Math.random() * motivationalReplies.length)];
  client
    .post("statuses/update", {
      in_reply_to_status_id: tweet_id,
      status: getReplyWithUsername(username, reply),
      auto_populate_reply_metadata: true
    })
    .then(() => console.log(`Replied to ${tweet.id}`))
    .catch(error => console.log("error", error));
};

// grab & 'favorite' as soon as program is running...
favoriteTweet();
// 'favorite' a tweet in every 2 minute
setInterval(favoriteTweet, 20000);

setInterval(() => {
  const tweet = client.get("search/tweets", { q: "#COVID -filter:retweets AND -filter:replies", count: "1" })
    .then(tweet => replyToTweet(tweet.statuses[0]))
}, 300000);

// function to generate a random tweet tweet
function ranDom (arr) {
  var index = Math.floor(Math.random()*arr.length);
  return arr[index];
};