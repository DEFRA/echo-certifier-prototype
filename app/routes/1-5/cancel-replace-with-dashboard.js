module.exports = function(router) {
  // Load helper functions
  var tools = require('../tools.js')


  // ADD extra routing here if needed.


  // CHANGE VERSION TO THE VERSION
  const version = '1-5'
  const base_url = version + "/cancel-replace-with-dashboard"
  const file_url = version + "/certifier"


  function updateStatus($data,$id,$status){
    console.log("** Updating status **")
   for (var i = 0; i < $data.length; i++) {
     console.log("looking at id "+$data[i].index+" case for "+$id)

     // for each field create an obj with the Key being the field name
     // and the value being the posted data from that field
     if($data[i].index == $id){
       console.log("found, updating status status")
       $data[i].status=$status
       return true;
     }
   }
   return false;
  }
  function duplicateCase($data,$id,$status){
    console.log("** duplicating **")
   for (var i = 0; i < $data.length; i++) {

     // for each field create an obj with the Key being the field name
     // and the value being the posted data from that field
     if($data[i].index == $id){
       console.log("duplicate found")
       console.log($data)
       var newCase = Object.assign({}, $data[i])
       newCase.id = $data.length+2
       newCase.is_replacement="yes"
       newCase.caseID = "19/16"+newCase.id
       newCase.status = $status
       $data.push(newCase)
       return true;
     }
   }
   return false;
  }
  router.use(function (req, res, next) {
    req.session.data.case_list = req.session.data.case_list || req.session.data.cases_v2;
    //hacky way to update statuses.
    if(req.query.update_status && req.query.cert_id){
      console.log("updating status")
      updateStatus(req.session.data.case_list, req.query.cert_id, req.query.update_status)
      console.log(req.session.data.case_list)
    }
    if(req.query.duplicate_case && req.query.cert_id){
      console.log("duplicating case")
      duplicateCase(req.session.data.case_list, req.query.cert_id, "processing")
    }
    if(req.query.clear){
      console.log("deleting data")
      req.session.data = ""
    }

   next()
 })

  router.post('/' + base_url + "*/replace/left-uk", function(req, res) {
      console.log("Posting from left uk")
      res.redirect(301, '/' + base_url + req.params[0] + '/replace/reason');
  })
  router.post('/' + base_url + "*/replace/cancel-replacement", function(req, res) {
    console.log("Posting from cancel replacement")
    console.log(req.body)

      if(req.session.data.cancel_replacement=="yes"){
        res.redirect(301, '/' + base_url + req.params[0] + '/dashboard');
      }else{
        res.redirect(301, '/' + base_url + req.params[0] + '/'+req.query.cancelation_return_url);
      }

  })
  router.post('/' + base_url + "*/replace/reason", function(req, res) {
    console.log(req.session.data.ehc)
    if(req.session.data.cancel_reason == "lost"){
      if(req.session.data.ehc=="7006EHC" || req.session.data.ehc=="6969EHC"){
        res.redirect(301, '/' + base_url + req.params[0] + '/replace/delivery-address');
      }else{
          var cert = req.session.data.ehc || "7006EHC"
        res.redirect(301, '/' + base_url + req.params[0] + '/certificates/'+cert+'/review-your-answers?is_replacement=yes');
      }
    }else if (req.session.data.has_left_uk == "yes" && req.session.data.ehc=="7006EHC"){
      res.redirect(301, '/' + base_url + req.params[0] + '/replace/delivery-address');
    }else{
      res.redirect(301, '/' + base_url + req.params[0] + '/replace/cannot-cancel-certificate');
    }

  })
  router.post('/' + base_url + "*/replace/delivery-address", function(req, res) {

      res.redirect(301, '/' + base_url + req.params[0] + '/replace/delivery-method');
  })
  router.post('/' + base_url + "/replace/delivery-method", function(req, res) {
    var cert = req.session.data.ehc || "7006EHC"
    res.redirect(301, '/' + base_url + req.params[0] + '/rules');
  })
  router.post('/' + base_url + "*/replace/rules", function(req, res) {
    var cert = req.session.data.ehc || "7006EHC"
    if(req.body.application_rule_confirm =="yes"){
      res.redirect(301, '/' + base_url + req.params[0] + '/certificates/'+cert+'/review-your-answers?is_replacement=yes');
    }else{
      res.redirect(301, '/' + base_url + req.params[0] + '/replace/cannot-cancel-certificate');
    }
  })
  router.post('/' + base_url + "*/replace/elegibility", function(req, res) {
    var cert = req.session.data.ehc || "7006EHC"
    if(req.body.application_rule_confirm =="yes"){
      res.redirect(301, '/' + base_url + req.params[0] + '/certificates/'+cert+'/review-your-answers?is_replacement=yes');
    }else{
      res.redirect(301, '/' + base_url + req.params[0] + '/replace/cannot-cancel-certificate');
    }
  })

  router.post('/' + base_url + "*/certificates/*/review-your-answers", function(req, res) {
    var cert = req.session.data.ehc || "7006EHC"
    res.redirect(301, '/' + base_url + req.params[0] + '/certificates/'+req.params[1]+'/confirmation');
  })
  router.post('/' + base_url + "*/certificates/*/confirmation", function(req, res) {
    //change to cancelled if we APHA do the cancelling
    console.log("confirmed  from v2")
    updateStatus(req.session.data.case_list, req.session.data.cert_id, "pending")
    duplicateCase(req.session.data.case_list, req.session.data.cert_id, "processing")
    res.redirect(301, '/' + base_url + req.params[0] + '/dashboard?has_cancellation_request=yes');
  })

  router.get('/' + base_url + '*', function(req, res) {

    var dir = req.params[0].split(/\/+/g);
    // Remove the main folder

    dir.shift()
    var baseDir = ""
    dir.forEach(function(element) {
      var path = "/" + element
      baseDir += path
    })
    console.log("trying to render " +base_url + req.params[0])
    // clear session info
    if(req.query.destroy=="yes"){
      req.session.destroy();
    }
    console.log(req.query)
    res.render(base_url + req.params[0], {"query":req.query},function(err, html) {
      if (err) {
        if (err.message.indexOf('template not found') !== -1) {
        console.log("Can find "+base_url + req.params[0]+ " in target directory, rendering page from Certifier jounrey")
        return res.render(file_url + baseDir,{"query":req.query});
      }
        throw err;
      }
      res.send(html);
    });
  })


}
