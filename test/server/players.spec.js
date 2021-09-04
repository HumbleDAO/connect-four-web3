import Player from '../../app/server/player.js';

describe('server player', function () {

  it('should initialize with arguments', function () {
    const socket = sinon.stub();
    const player = new Player({
      name: 'Caleb',
      color: 'green',
      socket
    });
    expect(player).to.have.property('name', 'Caleb');
    expect(player).to.have.property('color', 'green');
    expect(player).to.have.property('socket', socket);
    expect(player).to.have.property('score', 0);
  });

  it('should generate valid v4 UUID', function () {
    const player = new Player({
      name: 'Caleb',
      color: 'green',
      socket: null
    });
    expect(player.id).to.match(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
  });

  it('should know when socket is connected', function () {
    const socket = sinon.stub();
    const player = new Player({
      name: 'Caleb',
      color: 'green',
      socket
    });
    expect(player).to.have.property('connected', true);
  });

  it('should know when socket is not connected', function () {
    const player = new Player({
      name: 'Caleb',
      color: 'green',
      socket: null
    });
    expect(player).to.have.property('connected', false);
  });

  it('should serialize as JSON', function () {
    const socket = sinon.stub();
    const player = new Player({
      name: 'Caleb',
      color: 'green',
      socket
    });
    const json = player.toJSON();
    expect(json).to.have.property('id');
    expect(json).to.have.property('name', 'Caleb');
    expect(json).to.have.property('color', 'green');
    expect(json).to.have.property('connected', true);
    expect(json).to.have.property('lastDisconnectReason', null);
    expect(json).to.have.property('lastReaction', null);
  });

});
