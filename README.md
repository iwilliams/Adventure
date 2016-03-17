# Getting Started

You will need `node` and `gulp` installed to run and build this project.

`npm install && gulp build`

Navigate to `localhost:3000` or run `electron .`

# Project Details

This code is laying the groundwork for a _mostly functional_ JS game engine aimed at high performace 60fps games with multiplayer in mind. This specific repo is an excuse to develop the engine while making a rogue-esque game in the vein of the classic Shining the Holy Ark, or the more recent Etrian Odyssey series/Persona Q.

Most of the magic happens in `src/client/index.js` and `src/server/index.js`. The structure borrows and implements code from Facebook's Flux framework to achieve uni-directional data flow. The client code and "server" code (server code runs in a worker thread for now) are seperated to keep everything as modular as possible. The simulation loop runs idependently from the rendering loop at a default and configurable `30fps` while the rendering runs as fast as your browser will allow (usually `60fps`). In the future it should make no difference to the client code if the simulation is running locally or somewhere on the network.

I try to stream development semi-frequently over at [http://twitch.tv/ianawill](http://twitch.tv/ianawill) and the latest build stable build of the game can be found at [http://iwillia.ms](http://iwillia.ms). If you have any questions about what I'm doing here feel free to get in touch or make a pull request/open an issue.

This code comes with no warranty.
