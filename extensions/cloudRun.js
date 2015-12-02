var exec, promise;
 
exec = require('promised-exec');

/**
 * @description
 * @param dir
 * @returns 
 */
export const runNode = (id) => {
  var dir = getNodeDir(id);
  
  var cmdRun = "docker run -v " + dir + "/inputs:/inputs -v " + dir + "/outputs:/outputs -i \"" + id + "\" &";

  buildNodeContainer(id).then(result => {

            console.log("Done with Build...Running");
    
            return exec(cmdRun).then(result => {

                    console.log("Done with Run");

                }).catch(err => {
                    
                    //apparently, even warning messages trigger this section of exec, so it "usually" ok
                    console.log("Done with Run");

                });
        }).catch(err => {

            console.log(err);

        });
};

var nodesDoneBuilding = {};

export const buildNodeContainer = (id) => {
  var dir = getNodeDir(id);

  if (nodesDoneBuilding[id]) {
    console.log("Container for " + id + " already exists");
    return Promise.resolve(true);
  }
  
  var cmdBuild = "docker build -t \"" + id + "\" " + dir;  
  console.log("Start building " + id + "...");
  return exec(cmdBuild).then(result => {
      nodesDoneBuilding[id] = true;
      return Promise.resolve(result);
    }).catch(err => {
      console.log(id + " build failed: " + err.string);
      return Promise.reject(err);
    });
};

export const getNodeDir = (id) => {
    return process.cwd() + "/cloud/" + id;
};