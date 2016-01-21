const uuid = require('node-uuid');
const csv = require('fast-csv');

module.exports = exports = {};

exports.importProject = function importProject(csvstr) {
  return new Promise((resolve, reject) => {
    const proj = {
      'id': uuid.v4(),
      'metadata': {
        'authors': [],
        'tags': {},
        'version': '',
      },
      'components': [],
    };

    const blocks = {};

    function appendToProj(data) {
      let id, json, name, seq, type, color;

      name = data[0];
      seq = data[1];
      type = data[2];
      color = data[3];
      blocks[id] = {
        'id': uuid.v4(),
        'metadata': {
          'authors': [],
          'tags': {'type': type},
          'color': color,
          'version': '',
          'name': name,
        },
        'components': [],
        'sequence': {
          'sequence': seq,
          'features': [],
        },
      };
      proj.components.push(blocks[id]);

      return;
    }

    csv
     .fromString(csvstr, {headers: false, delimiter: '\t'})
     .on('data', data => {
       if (!data) {
         reject('CSV format is incorrect');
         return;
       }
       appendToProj(data);
     })
     .on('end', data => {
       resolve({ project: proj, blocks: blocks });
     });
  });
};
