# Speak-Ez

A small webapp to test user authentication and conditonal rendering based on user status (Project courtesy of The Odin Project); utilizing Express as our backend framework, PostgreSQL for our database, and EJS as our frontend.

Upon visiting the site, users may see a bunch of already posted messages written by anonymous users. The navbar gives the choices to sign up or login to the site, each with their own respective form to either make an account or authenticate the user. If the user is not already granted a member status, they will be directed to a page asking for the secret passphrase (there are 2 passphrases - one to grant member access and one to grant member + admin access). If users don't know the passphrase, they can still enter the message board and add their own messages, but the authors will still remain anonymous for them. Members will be able to see who wrote what post and admins will be able to delete posts in addition to member privileges.

Overall, after practicing Express via smaller scale apps prior to this, implementing the core functionality of the webapp was not too difficult. The Odin Project provided a good introduction to using passport.js, so moving those over to this app and doing some refactoring helped get over the hardest barrier for this project. I wouldn't consider myself competent in user authentication nor knowledgeable in passport.js, but these projects gave me the understanding to be able to utilize them in future projects.

Outside of further polish and creating a better UI/UX, possible improvements could include adding user profiles and profile pictures. Currently, users are just allowed to log in and make a post. It would be cool to replicate the experience of a social media site in the future with similar features and user experiences that reflect that.


