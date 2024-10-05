module.exports = {
  apps : [{
    script: 'npm start',
  }],

  deploy : {
    production : {
      key:'saas.pem',
      user : 'ubuntu',
      host : '13.232.53.128',
      ref  : 'origin/main',
      repo : 'https://github.com/CodexHashim/saas-docks.git',
      path : '/home/ubuntu',
      'pre-deploy-local': '',
      'post-deploy' : 'source ~/.nvm/nvm.sh && npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'ForwardAgent=yes'
    }
  }
};
