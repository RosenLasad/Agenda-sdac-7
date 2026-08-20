(function(){
  "use strict";

  var loginBtn = document.getElementById("loginBtn");
  var accountOverlay = document.getElementById("accountOverlay");
  var closeAccountBtn = document.getElementById("closeAccountBtn");
  var accountModalTitle = document.getElementById("accountModalTitle");
  var accountStatus = document.getElementById("accountStatus");
  var accountGuestView = document.getElementById("accountGuestView");
  var accountUserView = document.getElementById("accountUserView");
  var accountLoginEmail = document.getElementById("accountLoginEmail");
  var accountLoginPassword = document.getElementById("accountLoginPassword");
  var btnAccountLogin = document.getElementById("btnAccountLogin");
  var btnAccountRecover = document.getElementById("btnAccountRecover");
  var btnAccountContinueFreeLogin = document.getElementById("btnAccountContinueFreeLogin");
  var accountUserEmail = document.getElementById("accountUserEmail");
  var accountUserRole = document.getElementById("accountUserRole");
  var accountUserSync = document.getElementById("accountUserSync");
  var accountUserCtaTitle = document.getElementById("accountUserCtaTitle");
  var accountUserCtaText = document.getElementById("accountUserCtaText");
  var accountPermissionSummary = document.getElementById("accountPermissionSummary");
  var btnAccountManagePremium = document.getElementById("btnAccountManagePremium");
  var btnAccountLogout = document.getElementById("btnAccountLogout");

  function callAgendaHook(name, arg){
    try{
      if(window.AgendaApp && typeof window.AgendaApp[name] === "function"){
        window.AgendaApp[name](arg);
      }
    }catch(e){}
  }

  function getIdentityUser(){
    try{
      return window.netlifyIdentity && window.netlifyIdentity.currentUser && window.netlifyIdentity.currentUser();
    }catch(e){
      return null;
    }
  }

  function getIdentityClient(){
    try{
      return window.netlifyIdentity && (window.netlifyIdentity.gotrue || window.netlifyIdentity);
    }catch(e){
      return null;
    }
  }

  function getAccountRole(user){
    if(!user) return "guest";
    var appMeta = user.app_metadata || {};
    var roles = Array.isArray(appMeta.roles) ? appMeta.roles.map(function(role){ return String(role || "").toLowerCase(); }) : [];
    if(roles.indexOf("admin") !== -1) return "admin";
    if(roles.indexOf("socio") !== -1) return "socio";
    if(roles.indexOf("docente") !== -1) return "docente";
    return "none";
  }

  function getRoleLabel(role){
    if(role === "admin") return "Admin";
    if(role === "socio") return "Socio";
    if(role === "docente") return "Docente";
    if(role === "guest") return "Ospite";
    return "Non assegnato";
  }

  function getRoleDescription(role){
    if(role === "admin"){
      return {
        title: "Accesso completo",
        text: "Puoi usare tutte le aree di SDAC Agenda, incluse Impostazioni e le future sezioni amministrative.",
        summary: "Calendario · Oggi · Taccuino · Rubrica · Impostazioni · future aree riservate"
      };
    }
    if(role === "socio"){
      return {
        title: "Accesso Socio",
        text: "Puoi usare le aree operative condivise. Il menu Impostazioni resta riservato all'Admin.",
        summary: "Calendario · Oggi · Taccuino · Rubrica · Cloud"
      };
    }
    if(role === "docente"){
      return {
        title: "Accesso Docente",
        text: "Puoi usare Calendario, Oggi e Cloud. Taccuino, Rubrica, Impostazioni e aree amministrative non sono disponibili.",
        summary: "Calendario · Oggi · Cloud"
      };
    }
    return {
      title: "Ruolo da assegnare",
      text: "L'account è autenticato, ma non ha ancora un ruolo SDAC valido. Assegna Admin, Socio o Docente da Netlify e poi effettua di nuovo l'accesso.",
      summary: "Accesso limitato finché non viene assegnato un ruolo"
    };
  }

  function refreshLoginBtn(){
    if(!loginBtn) return;
    var user = getIdentityUser();
    var role = getAccountRole(user);
    loginBtn.textContent = user ? "Cloud" : "Accesso";
    loginBtn.setAttribute("data-role", role);
    loginBtn.title = user ? ("Cloud SDAC · " + getRoleLabel(role)) : "Accedi a SDAC Agenda";
  }

  function setAccountMessage(text, type){
    if(!accountStatus) return;
    if(!text){
      accountStatus.textContent = "";
      accountStatus.className = "accountStatus hidden";
      return;
    }
    accountStatus.textContent = text;
    accountStatus.className = "accountStatus accountStatus--" + (type || "info");
  }

  function renderAccountModal(){
    if(!accountOverlay) return;
    var user = getIdentityUser();
    var role = getAccountRole(user);
    var roleInfo = getRoleDescription(role);

    if(accountModalTitle) accountModalTitle.textContent = user ? "Cloud SDAC" : "Accesso SDAC";
    if(accountGuestView) accountGuestView.classList.toggle("hidden", !!user);
    if(accountUserView) accountUserView.classList.toggle("hidden", !user);

    if(user){
      if(accountUserEmail) accountUserEmail.textContent = user.email || "—";
      if(accountUserRole){
        accountUserRole.textContent = getRoleLabel(role);
        accountUserRole.setAttribute("data-role", role);
      }
      if(accountUserSync) accountUserSync.textContent = (role === "admin" || role === "socio" || role === "docente") ? "Attiva" : "Bloccata";
      if(accountUserCtaTitle) accountUserCtaTitle.textContent = roleInfo.title;
      if(accountUserCtaText) accountUserCtaText.textContent = roleInfo.text;
      if(accountPermissionSummary) accountPermissionSummary.textContent = roleInfo.summary;
      if(btnAccountManagePremium) btnAccountManagePremium.textContent = "Controlla Cloud SDAC";
    }

    refreshLoginBtn();
  }

  function openAccountModal(){
    if(!accountOverlay) return;
    setAccountMessage("", "info");
    renderAccountModal();
    accountOverlay.style.display = "flex";
    accountOverlay.setAttribute("aria-hidden", "false");

    setTimeout(function(){
      try{
        if(getIdentityUser()){
          if(btnAccountManagePremium) btnAccountManagePremium.focus();
        }else if(accountLoginEmail){
          accountLoginEmail.focus();
        }
      }catch(e){}
    }, 30);
  }

  function closeAccountModal(){
    if(!accountOverlay) return;
    accountOverlay.style.display = "none";
    accountOverlay.setAttribute("aria-hidden", "true");
    setAccountMessage("", "info");
  }

  function isAccountModalOpen(){
    return !!(accountOverlay && accountOverlay.style.display === "flex");
  }

  function handleCloudIntent(){
    var user = getIdentityUser();
    if(!user){
      openAccountModal();
      return;
    }
    var role = getAccountRole(user);
    if(role === "none"){
      setAccountMessage("Questo account non ha ancora un ruolo SDAC. Assegna Admin, Socio o Docente da Netlify, poi esci e accedi di nuovo.", "error");
      return;
    }
    closeAccountModal();
    callAgendaHook("requestSoftSync");
  }

  function handleAccountLogin(){
    var auth = getIdentityClient();
    if(!auth || !auth.login){
      setAccountMessage("Accesso non disponibile in questo momento.", "error");
      return;
    }

    var email = String((accountLoginEmail && accountLoginEmail.value) || "").trim();
    var password = String((accountLoginPassword && accountLoginPassword.value) || "");

    if(!email || !password){
      setAccountMessage("Inserisci email e password.", "error");
      if(!email && accountLoginEmail) accountLoginEmail.focus();
      else if(accountLoginPassword) accountLoginPassword.focus();
      return;
    }

    setAccountMessage("Accesso in corso...", "info");
    auth.login(email, password, true).then(function(){
      var user = getIdentityUser();
      var role = getAccountRole(user);
      if(role === "none"){
        setAccountMessage("Accesso effettuato, ma il ruolo SDAC non è ancora assegnato. Impostalo da Netlify e poi effettua nuovamente l'accesso.", "error");
      }else{
        setAccountMessage("Accesso effettuato come " + getRoleLabel(role) + ".", "success");
      }
      renderAccountModal();
      refreshLoginBtn();
    }).catch(function(error){
      var msg = (error && ((error.json && error.json.error_description) || error.message)) || "Accesso non riuscito.";
      setAccountMessage(msg, "error");
    });
  }

  function handleAccountRecovery(){
    var auth = getIdentityClient();
    if(!auth || !auth.requestPasswordRecovery){
      setAccountMessage("Recupero password non disponibile in questo momento.", "error");
      return;
    }

    var email = String((accountLoginEmail && accountLoginEmail.value) || "").trim();
    if(!email){
      setAccountMessage("Inserisci la tua email per ricevere il link di recupero.", "error");
      if(accountLoginEmail) accountLoginEmail.focus();
      return;
    }

    setAccountMessage("Invio email di recupero...", "info");
    auth.requestPasswordRecovery(email).then(function(){
      setAccountMessage("Ti abbiamo inviato un'email per reimpostare la password.", "success");
    }).catch(function(error){
      var msg = (error && ((error.json && error.json.msg) || (error.json && error.json.error_description) || error.message)) || "Invio email non riuscito.";
      setAccountMessage(msg, "error");
    });
  }

  function handleAccountLogout(){
    if(!window.netlifyIdentity || !window.netlifyIdentity.logout) return;
    window.netlifyIdentity.logout().then(function(){
      setAccountMessage("Sei uscito dal tuo account.", "success");
      renderAccountModal();
    }).catch(function(){
      setAccountMessage("Logout non riuscito.", "error");
    });
  }

  window.AgendaAccount = {
    open: openAccountModal,
    close: closeAccountModal,
    isOpen: isAccountModalOpen,
    getRole: function(){ return getAccountRole(getIdentityUser()); }
  };

  if(window.netlifyIdentity){
    if(loginBtn){
      loginBtn.addEventListener("click", function(){ openAccountModal(); });
    }
    if(closeAccountBtn) closeAccountBtn.addEventListener("click", closeAccountModal);
    if(btnAccountLogin) btnAccountLogin.addEventListener("click", handleAccountLogin);
    if(btnAccountRecover) btnAccountRecover.addEventListener("click", handleAccountRecovery);
    if(btnAccountContinueFreeLogin) btnAccountContinueFreeLogin.addEventListener("click", closeAccountModal);
    if(btnAccountManagePremium) btnAccountManagePremium.addEventListener("click", handleCloudIntent);
    if(btnAccountLogout) btnAccountLogout.addEventListener("click", handleAccountLogout);

    if(accountOverlay){
      accountOverlay.addEventListener("click", function(ev){
        if(ev.target === accountOverlay) closeAccountModal();
      });
    }

    if(accountLoginPassword){
      accountLoginPassword.addEventListener("keydown", function(ev){
        if(ev.key === "Enter") handleAccountLogin();
      });
    }

    window.netlifyIdentity.on("init", function(user){
      refreshLoginBtn();
      renderAccountModal();
      callAgendaHook("onIdentityInit", user);
    });

    window.netlifyIdentity.on("login", function(user){
      refreshLoginBtn();
      renderAccountModal();
      callAgendaHook("onIdentityLogin", user);
    });

    window.netlifyIdentity.on("logout", function(){
      refreshLoginBtn();
      renderAccountModal();
      callAgendaHook("onIdentityLogout");
    });

    window.netlifyIdentity.on("error", function(err){
      var msg = (err && ((err.json && err.json.error_description) || err.message)) || "Operazione non riuscita.";
      setAccountMessage(msg, "error");
    });

    window.netlifyIdentity.init();
  }else if(loginBtn){
    loginBtn.classList.add("hidden");
  }

  document.addEventListener("keydown", function(ev){
    if(ev.key === "Escape" && isAccountModalOpen()) closeAccountModal();
  });
})();
