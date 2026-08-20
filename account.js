(function(){
  "use strict";

  var RECENT_EMAILS_KEY = "sdacAgenda.recentLoginEmails.v1";
  var AUTH_FLOW_SESSION_KEY = "sdacAgenda.pendingAuthFlow.v1";
  var MAX_RECENT_EMAILS = 6;

  var loginBtn = document.getElementById("loginBtn");
  var sessionRoleBadge = document.getElementById("sessionRoleBadge");
  var sessionRoleIcon = document.getElementById("sessionRoleIcon");
  var sessionRoleText = document.getElementById("sessionRoleText");
  var accountOverlay = document.getElementById("accountOverlay");
  var closeAccountBtn = document.getElementById("closeAccountBtn");
  var accountModalTitle = document.getElementById("accountModalTitle");
  var accountStatus = document.getElementById("accountStatus");
  var accountGuestView = document.getElementById("accountGuestView");
  var accountUserView = document.getElementById("accountUserView");
  var accountLoginPane = document.getElementById("accountLoginPane");
  var accountLoginForm = document.getElementById("accountLoginForm");
  var accountLoginEmail = document.getElementById("accountLoginEmail");
  var accountLoginPassword = document.getElementById("accountLoginPassword");
  var accountRecentEmails = document.getElementById("accountRecentEmails");
  var btnAccountLogin = document.getElementById("btnAccountLogin");
  var btnAccountRecover = document.getElementById("btnAccountRecover");
  var btnAccountContinueFreeLogin = document.getElementById("btnAccountContinueFreeLogin");

  var accountPasswordPane = document.getElementById("accountPasswordPane");
  var accountPasswordTitle = document.getElementById("accountPasswordTitle");
  var accountPasswordText = document.getElementById("accountPasswordText");
  var accountPasswordForm = document.getElementById("accountPasswordForm");
  var accountNewPassword = document.getElementById("accountNewPassword");
  var accountNewPasswordConfirm = document.getElementById("accountNewPasswordConfirm");
  var btnAccountSetPassword = document.getElementById("btnAccountSetPassword");
  var btnAccountPasswordCancel = document.getElementById("btnAccountPasswordCancel");

  var accountUserEmail = document.getElementById("accountUserEmail");
  var accountUserRole = document.getElementById("accountUserRole");
  var accountUserSync = document.getElementById("accountUserSync");
  var accountUserCtaTitle = document.getElementById("accountUserCtaTitle");
  var accountUserCtaText = document.getElementById("accountUserCtaText");
  var accountPermissionSummary = document.getElementById("accountPermissionSummary");
  var btnAccountManagePremium = document.getElementById("btnAccountManagePremium");
  var btnAccountLogout = document.getElementById("btnAccountLogout");

  var pendingAuthFlow = loadPendingAuthFlow();
  var pendingFlowBusy = false;

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

  function safeParseJson(text, fallback){
    try{ return JSON.parse(text); }catch(e){ return fallback; }
  }

  function readRecentEmails(){
    try{
      var parsed = safeParseJson(localStorage.getItem(RECENT_EMAILS_KEY) || "[]", []);
      if(!Array.isArray(parsed)) return [];
      return parsed.filter(function(item){ return typeof item === "string" && item.indexOf("@") > 0; }).slice(0, MAX_RECENT_EMAILS);
    }catch(e){
      return [];
    }
  }

  function rememberEmail(email){
    email = String(email || "").trim().toLowerCase();
    if(!email || email.indexOf("@") <= 0) return;
    var emails = readRecentEmails().filter(function(item){ return item.toLowerCase() !== email; });
    emails.unshift(email);
    emails = emails.slice(0, MAX_RECENT_EMAILS);
    try{ localStorage.setItem(RECENT_EMAILS_KEY, JSON.stringify(emails)); }catch(e){}
    renderRecentEmails();
  }

  function renderRecentEmails(){
    if(!accountRecentEmails) return;
    accountRecentEmails.innerHTML = "";
    readRecentEmails().forEach(function(email){
      var option = document.createElement("option");
      option.value = email;
      accountRecentEmails.appendChild(option);
    });
  }

  function savePendingAuthFlow(flow){
    pendingAuthFlow = flow || null;
    try{
      if(pendingAuthFlow) sessionStorage.setItem(AUTH_FLOW_SESSION_KEY, JSON.stringify(pendingAuthFlow));
      else sessionStorage.removeItem(AUTH_FLOW_SESSION_KEY);
    }catch(e){}
  }

  function loadPendingAuthFlow(){
    var stored = null;
    try{ stored = safeParseJson(sessionStorage.getItem(AUTH_FLOW_SESSION_KEY) || "null", null); }catch(e){}

    var hash = String(window.location.hash || "");
    if(hash.charAt(0) === "#") hash = hash.slice(1);
    var params = new URLSearchParams(hash);
    var inviteToken = params.get("invite_token");
    var recoveryToken = params.get("recovery_token");
    var flow = stored;

    if(inviteToken){
      flow = { type:"invite", token:inviteToken, stage:"password" };
    }else if(recoveryToken){
      flow = { type:"recovery", token:recoveryToken, stage:"recover" };
    }

    if(inviteToken || recoveryToken){
      try{
        sessionStorage.setItem(AUTH_FLOW_SESSION_KEY, JSON.stringify(flow));
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
      }catch(e){}
    }
    return flow;
  }

  function clearPendingAuthFlow(){
    savePendingAuthFlow(null);
    pendingFlowBusy = false;
  }

  function isPasswordFlow(){
    return !!(pendingAuthFlow && (pendingAuthFlow.type === "invite" || pendingAuthFlow.type === "recovery"));
  }

  function refreshHeaderRoleBadge(){
    if(!sessionRoleBadge) return;
    var user = getIdentityUser();
    var role = isPasswordFlow() ? "guest" : getAccountRole(user);
    var icon = "👤";
    if(role === "admin") icon = "🛡️";
    else if(role === "socio") icon = "👥";
    else if(role === "docente") icon = "🎓";
    else if(role === "none") icon = "⚠️";

    var label = getRoleLabel(role);
    sessionRoleBadge.setAttribute("data-role", role);
    sessionRoleBadge.setAttribute("title", "Ruolo attivo: " + label);
    sessionRoleBadge.setAttribute("aria-label", "Ruolo attivo: " + label);
    if(sessionRoleIcon) sessionRoleIcon.textContent = icon;
    if(sessionRoleText) sessionRoleText.textContent = label;
  }

  function refreshLoginBtn(){
    refreshHeaderRoleBadge();
    if(!loginBtn) return;
    var user = getIdentityUser();
    var role = getAccountRole(user);
    loginBtn.textContent = user && !isPasswordFlow() ? "Cloud" : "Accesso";
    loginBtn.setAttribute("data-role", role);
    loginBtn.title = user && !isPasswordFlow() ? ("Cloud SDAC · " + getRoleLabel(role)) : "Accedi a SDAC Agenda";
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

  function setPasswordFlowUi(){
    var active = isPasswordFlow();
    if(accountLoginPane) accountLoginPane.classList.toggle("hidden", active);
    if(accountPasswordPane) accountPasswordPane.classList.toggle("hidden", !active);
    if(!active) return;

    if(pendingAuthFlow.type === "invite"){
      if(accountModalTitle) accountModalTitle.textContent = "Attiva account SDAC";
      if(accountPasswordTitle) accountPasswordTitle.textContent = "Crea la tua password";
      if(accountPasswordText) accountPasswordText.textContent = "Hai aperto un invito SDAC. Scegli una password personale per completare l'attivazione dell'account.";
      if(btnAccountSetPassword) btnAccountSetPassword.textContent = "Crea password e accedi";
    }else{
      if(accountModalTitle) accountModalTitle.textContent = "Reimposta password";
      if(accountPasswordTitle) accountPasswordTitle.textContent = "Imposta una nuova password";
      if(accountPasswordText) accountPasswordText.textContent = "Il link di recupero è stato verificato. Scegli la nuova password che userai per i prossimi accessi.";
      if(btnAccountSetPassword) btnAccountSetPassword.textContent = "Salva nuova password";
    }
  }

  function renderAccountModal(){
    if(!accountOverlay) return;
    var user = getIdentityUser();
    var role = getAccountRole(user);
    var roleInfo = getRoleDescription(role);
    var passwordFlow = isPasswordFlow();

    if(!passwordFlow && accountModalTitle) accountModalTitle.textContent = user ? "Cloud SDAC" : "Accesso SDAC";
    if(accountGuestView) accountGuestView.classList.toggle("hidden", !!user && !passwordFlow);
    if(accountUserView) accountUserView.classList.toggle("hidden", !user || passwordFlow);
    setPasswordFlowUi();

    if(user && !passwordFlow){
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

  function focusBestAccountField(){
    setTimeout(function(){
      try{
        if(isPasswordFlow()){
          if(accountNewPassword) accountNewPassword.focus();
        }else if(getIdentityUser()){
          if(btnAccountManagePremium) btnAccountManagePremium.focus();
        }else if(accountLoginEmail){
          accountLoginEmail.focus();
        }
      }catch(e){}
    }, 30);
  }

  function openAccountModal(){
    if(!accountOverlay) return;
    setAccountMessage("", "info");
    renderAccountModal();
    accountOverlay.style.display = "flex";
    accountOverlay.setAttribute("aria-hidden", "false");
    focusBestAccountField();
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
    auth.login(email, password, true).then(function(user){
      user = user || getIdentityUser();
      rememberEmail((user && user.email) || email);
      if(accountLoginPassword) accountLoginPassword.value = "";
      var role = getAccountRole(user);
      if(role === "none"){
        setAccountMessage("Accesso effettuato, ma il ruolo SDAC non è ancora assegnato. Impostalo da Netlify e poi effettua nuovamente l'accesso.", "error");
      }else{
        setAccountMessage("Accesso effettuato come " + getRoleLabel(role) + ".", "success");
      }
      callAgendaHook("onIdentityLogin", user);
      renderAccountModal();
      refreshLoginBtn();
    }).catch(function(error){
      var msg = (error && ((error.json && error.json.error_description) || (error.json && error.json.msg) || error.message)) || "Accesso non riuscito.";
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

    rememberEmail(email);
    setAccountMessage("Invio email di recupero...", "info");
    auth.requestPasswordRecovery(email).then(function(){
      setAccountMessage("Email inviata. Apri il link ricevuto: Agenda ti chiederà di scegliere una nuova password.", "success");
    }).catch(function(error){
      var msg = (error && ((error.json && error.json.msg) || (error.json && error.json.error_description) || error.message)) || "Invio email non riuscito.";
      setAccountMessage(msg, "error");
    });
  }

  function validateNewPasswords(){
    var password = String((accountNewPassword && accountNewPassword.value) || "");
    var confirm = String((accountNewPasswordConfirm && accountNewPasswordConfirm.value) || "");
    if(!password || !confirm){
      setAccountMessage("Inserisci e conferma la nuova password.", "error");
      if(!password && accountNewPassword) accountNewPassword.focus();
      else if(accountNewPasswordConfirm) accountNewPasswordConfirm.focus();
      return null;
    }
    if(password !== confirm){
      setAccountMessage("Le due password non coincidono.", "error");
      if(accountNewPasswordConfirm) accountNewPasswordConfirm.focus();
      return null;
    }
    return password;
  }

  function finishPasswordFlow(user, message){
    user = user || getIdentityUser();
    if(user && user.email) rememberEmail(user.email);
    if(accountNewPassword) accountNewPassword.value = "";
    if(accountNewPasswordConfirm) accountNewPasswordConfirm.value = "";
    clearPendingAuthFlow();
    setAccountMessage(message || "Password impostata correttamente.", "success");
    callAgendaHook("onIdentityLogin", user);
    renderAccountModal();
    refreshLoginBtn();
  }

  function handleSetPassword(){
    if(!pendingAuthFlow || pendingFlowBusy) return;
    var auth = getIdentityClient();
    var password = validateNewPasswords();
    if(!password) return;

    pendingFlowBusy = true;
    if(btnAccountSetPassword) btnAccountSetPassword.disabled = true;

    if(pendingAuthFlow.type === "invite"){
      if(!auth || !auth.acceptInvite || !pendingAuthFlow.token){
        pendingFlowBusy = false;
        if(btnAccountSetPassword) btnAccountSetPassword.disabled = false;
        setAccountMessage("Invito non valido o scaduto. Chiedi alla SDAC di inviare un nuovo invito.", "error");
        return;
      }
      setAccountMessage("Attivazione account in corso...", "info");
      auth.acceptInvite(pendingAuthFlow.token, password, true).then(function(user){
        finishPasswordFlow(user, "Account attivato. La tua password è stata impostata correttamente.");
      }).catch(function(error){
        pendingFlowBusy = false;
        if(btnAccountSetPassword) btnAccountSetPassword.disabled = false;
        var msg = (error && ((error.json && error.json.msg) || (error.json && error.json.error_description) || error.message)) || "Attivazione non riuscita.";
        setAccountMessage(msg, "error");
      });
      return;
    }

    var user = getIdentityUser();
    if(!user || !user.update){
      pendingFlowBusy = false;
      if(btnAccountSetPassword) btnAccountSetPassword.disabled = false;
      setAccountMessage("Il link di recupero non è più attivo. Richiedi una nuova email di recupero.", "error");
      return;
    }

    setAccountMessage("Salvataggio nuova password...", "info");
    user.update({ password: password }).then(function(updatedUser){
      finishPasswordFlow(updatedUser || user, "Password aggiornata. Ora puoi usare normalmente questo account SDAC.");
    }).catch(function(error){
      pendingFlowBusy = false;
      if(btnAccountSetPassword) btnAccountSetPassword.disabled = false;
      var msg = (error && ((error.json && error.json.msg) || (error.json && error.json.error_description) || error.message)) || "Aggiornamento password non riuscito.";
      setAccountMessage(msg, "error");
    });
  }

  function cancelPasswordFlow(){
    clearPendingAuthFlow();
    if(accountNewPassword) accountNewPassword.value = "";
    if(accountNewPasswordConfirm) accountNewPasswordConfirm.value = "";
    setAccountMessage("Operazione annullata. Per riprenderla dovrai riaprire il link ricevuto via email.", "info");
    renderAccountModal();
    if(accountLoginEmail) accountLoginEmail.focus();
  }

  function startPendingAuthFlow(){
    if(!pendingAuthFlow) return;
    openAccountModal();

    if(pendingAuthFlow.type === "invite"){
      setAccountMessage("Invito riconosciuto. Scegli una password personale per attivare l'account.", "info");
      renderAccountModal();
      focusBestAccountField();
      return;
    }

    if(pendingAuthFlow.type === "recovery" && pendingAuthFlow.stage === "ready"){
      setAccountMessage("Link verificato. Scegli ora la nuova password.", "info");
      renderAccountModal();
      focusBestAccountField();
      return;
    }

    var auth = getIdentityClient();
    if(!auth || !auth.recover || !pendingAuthFlow.token){
      setAccountMessage("Link di recupero non valido o scaduto. Richiedi una nuova email di recupero.", "error");
      return;
    }

    if(pendingFlowBusy) return;
    pendingFlowBusy = true;
    setAccountMessage("Verifica del link di recupero...", "info");
    auth.recover(pendingAuthFlow.token, true).then(function(user){
      pendingFlowBusy = false;
      if(user && user.email) rememberEmail(user.email);
      savePendingAuthFlow({ type:"recovery", stage:"ready" });
      callAgendaHook("onIdentityLogout");
      setAccountMessage("Link verificato. Scegli ora la nuova password.", "success");
      renderAccountModal();
      focusBestAccountField();
    }).catch(function(error){
      pendingFlowBusy = false;
      var msg = (error && ((error.json && error.json.msg) || (error.json && error.json.error_description) || error.message)) || "Link di recupero non valido o scaduto.";
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

  renderRecentEmails();
  refreshHeaderRoleBadge();

  if(window.netlifyIdentity){
    if(loginBtn){
      loginBtn.addEventListener("click", function(){ openAccountModal(); });
    }
    if(closeAccountBtn) closeAccountBtn.addEventListener("click", closeAccountModal);
    if(accountLoginForm) accountLoginForm.addEventListener("submit", function(ev){ ev.preventDefault(); handleAccountLogin(); });
    else if(btnAccountLogin) btnAccountLogin.addEventListener("click", handleAccountLogin);
    if(btnAccountRecover) btnAccountRecover.addEventListener("click", handleAccountRecovery);
    if(btnAccountContinueFreeLogin) btnAccountContinueFreeLogin.addEventListener("click", closeAccountModal);
    if(accountPasswordForm) accountPasswordForm.addEventListener("submit", function(ev){ ev.preventDefault(); handleSetPassword(); });
    if(btnAccountPasswordCancel) btnAccountPasswordCancel.addEventListener("click", cancelPasswordFlow);
    if(btnAccountManagePremium) btnAccountManagePremium.addEventListener("click", handleCloudIntent);
    if(btnAccountLogout) btnAccountLogout.addEventListener("click", handleAccountLogout);

    if(accountOverlay){
      accountOverlay.addEventListener("click", function(ev){
        if(ev.target === accountOverlay) closeAccountModal();
      });
    }

    window.netlifyIdentity.on("init", function(user){
      refreshLoginBtn();
      renderAccountModal();
      if(pendingAuthFlow){
        callAgendaHook("onIdentityLogout");
        startPendingAuthFlow();
      }else{
        callAgendaHook("onIdentityInit", user);
      }
    });

    window.netlifyIdentity.on("login", function(user){
      if(pendingAuthFlow) return;
      refreshLoginBtn();
      renderAccountModal();
      if(user && user.email) rememberEmail(user.email);
      callAgendaHook("onIdentityLogin", user);
    });

    window.netlifyIdentity.on("logout", function(){
      if(pendingAuthFlow) return;
      refreshLoginBtn();
      renderAccountModal();
      callAgendaHook("onIdentityLogout");
    });

    window.netlifyIdentity.on("error", function(err){
      var msg = (err && ((err.json && err.json.error_description) || (err.json && err.json.msg) || err.message)) || "Operazione non riuscita.";
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
