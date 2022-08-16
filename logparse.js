// const port = process.env.PORT || 3000;

const testme = "A man, a plan, a canal, Panama";
const parser = /^A (\w+), a (\w+), a (\w+), (\w+)$/;

const msg = 'exabeam-2022.06.06	logs	lms.kafka.topic_80_7285677907_65a6ae1dce0a	0	128.197.27.248	2022-06-06T11:25:18.495Z	2022-06-06T11:25:19.100Z	2022-06-06T11:25:19.100Z	"<30>Jun  6 07:25:18 cussp6.1d_128.197.26.22:969[16305]: millie@ist-uisc-ap-pr2.bu.edu: main::useradm_2::useradm(pre_register, -host, google, -pintype, email, -buid, U25342950, -lastname, Suvarna, -firstname, Nainika Vasant, -email, nainika503@gmail.com, -gender, , -ssn, , -dob, 20000325, -start, , -ndays, 62, -sponsorbuid, , -acctexpiredate, , -duration, , -renewstart, , -renewend, , -address, , -phone, , -deptid, , -sendmail, pre-register.ebgrad, -nidinfo, 50, -course, graduate, -mkmbox, 0)';
// const msg_parser = /^[^\]]+\]: ([^:]+): main::useradm_2::useradm\(pre_register, (.*)\) "/;
const msg_parser = /^[^\]]+\]: (?<from>[^@]*)@(?<host>[^:]+): main::useradm_2::useradm\(pre_register, (?<args>.*)\)"*/;

// this is a mapping for hostnames to clusters
const host_mapping = {
  "ist-uisc-ap-pr1.bu.edu": "uiscgi-prod",
  "ist-uisc-ap-pr2.bu.edu": "uiscgi-prod",
  "ist-uisc-ap-pr3.bu.edu": "uiscgi-prod",
  "ist-uisc-ap-pr4.bu.edu": "uiscgi-prod",

  "software8-weblogin.bu.edu": "weblogin-prod",
  "software11-weblogin.bu.edu": "weblogin-prod",

  "ist-uisc-ap-dv1.bu.edu": "uiscgi-dev",

  "ist-uisc-ap-qa1.bu.edu": "uiscgi-qa",

  "ist-uisc-ap-te1.bu.edu": "uiscgi-test",
  "ist-uisc-ap-te2.bu.edu": "uiscgi-test",
}

// The following version is the equivalent of above - notice how the backslashes need to be doubled
// const parser = new RegExp('^A (\\w+), a (\\w+), a (\\w+), (\\w+)$');
// const parser = new RegExp("\w+\s", 'g');

console.log("string is: " + msg);

const matched = msg_parser.exec(msg);
console.log(matched);
if (!matched) {
  console.log("parser did not match");
} else {
  console.log(`from: ${matched.groups.from}, host: ${matched.groups.host} args: ${matched.groups.args}`);

  var argList = matched.groups.args.split(", ");
  // console.log("argList=%s", argList);
  var args = {
    'caller_acct': matched.groups.from,
    'caller_host': host_mapping[matched.groups.host] || matched.groups.host,
    'caller_system': matched.groups.host
  };
  var isKey = true;
  argList.forEach(function(val, index, theArray) {
      // console.log("val=%s index=%d val+1=%s", val, index, theArray[index+1]);
      if (isKey) {
        args[val] = theArray[index+1];
        isKey = false;
      } else {
        isKey = true;
      }
  });
  console.log("args=%s", args);
}
