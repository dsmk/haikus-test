#!/usr/bin/env node
// const port = process.env.PORT || 3000;

const bulogin_msg = 'exabeam-2022.06.06	logs	lms.kafka.topic_80_7285677907_65a6ae1dce0a	0	128.197.27.248	2022-06-06T11:25:18.495Z	2022-06-06T11:25:19.100Z	2022-06-06T11:25:19.100Z	"<30>Jun  6 07:25:18 cussp6.1d_128.197.26.22:969[16305]: millie@ist-uisc-ap-pr2.bu.edu: main::useradm_2::useradm(pre_register, -host, google, -pintype, email, -buid, U25342950, -lastname, Suvarna, -firstname, Nainika Vasant, -email, nainika503@gmail.com, -gender, , -ssn, , -dob, 20000325, -start, , -ndays, 62, -sponsorbuid, , -acctexpiredate, , -duration, , -renewstart, , -renewend, , -address, , -phone, , -deptid, , -sendmail, pre-register.ebgrad, -nidinfo, 50, -course, graduate, -mkmbox, 0)';
const buweb_msg = '01/01/messages.ist-webacct-prod02.20220101.gz:Jan  1 14:24:54 ist-webacct-prod02 cussp6.1d_971[23628]: gradadm@ist-uiscgi-app-prod01.bu.edu: main::useradm_2::useradm(pre_register, -host, INTLPROG, -pintype, email, -buid, U58604232, -lastname, Quinn, -firstname, Shanelle, -email, squinn18@jhu.edu, -gender, , -ssn, , -dob, 20010630, -start, 20220101:1424:0001, -ndays, 60, -sponsorbuid, , -acctexpiredate, , -duration, , -renewstart, , -renewend, , -address, , -phone, , -deptid, , -sendmail, 0, -nidinfo, , -course, , -mkmbox, 0) ';

// const line_reader = require('line-reader');
const fs = require('fs');
const process = require('process');

// The following version is the equivalent of above - notice how the backslashes need to be doubled
// const parser = new RegExp('^A (\\w+), a (\\w+), a (\\w+), (\\w+)$');
// const parser = new RegExp("\w+\s", 'g');

// console.log("string is: " + msg);

class LogParser {
  // const msg_parser = /^[^\]]+\]: ([^:]+): main::useradm_2::useradm\(pre_register, (.*)\) "/;
  #msg_parser = /^[^\]]+\]: (?<from>[^@]*)@(?<host>[^:]+): main::useradm_2::useradm\(pre_register, (?<args>.*)\)"*/;

  // this is a mapping for hostnames to clusters
  #host_mapping = {
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

  constructor() {
    this.data = new Tally();
    this.rejects = new Tally();
  }

  add_file (fname) {
    // line_reader.eachLine(fname, function(line) {
    //   console.log("line=%s", line);
    //   this.add_line(line);
    // });
    fs.readFileSync(fname).toString().split('\n').forEach(line => {
      // console.log('line=%s', line);
      this.add_line(line);
    });
  }

  add_line (line) {
    const matched = this.#msg_parser.exec(line);
    // console.log(matched);

    if (line.length == 0) {
      console.log("parser did not match(%d)=(%s)", line.length, line);
      this.rejects.add("[empty line]");
    } else if (!matched) {
      console.log("parser did not match(%d)=(%s)", line.length, line);
      this.rejects.add(line);
    } else {
      // console.log(`from: ${matched.groups.from}, host: ${matched.groups.host} args: ${matched.groups.args}`);

      var argList = matched.groups.args.split(", ");
      // console.log("argList=%s", argList);
      var args = {
        'caller_acct': matched.groups.from,
        'caller_host': this.#host_mapping[matched.groups.host] || matched.groups.host,
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
      // console.log("args=%s", args);

      var key = `"${args['-host']}","${args['-pintype']}","${args['mkmbox']}","${args['-sendmail']}","${args['caller_acct']}","${args['caller_host']}"`;

      console.log("key=%s", key);
      this.data.add(key);
    }
  }

  generate_csv () {
    console.log('"number","sponsorcode","pintype","mkmbox","sendmail","person","host"');
    this.data.forEach( (key) => {
      console.log('"%s",%s', this.data.get(key), key);
    });
  }
}

// the following class helps us tally things for the parser
class Tally {
  constructor () {
    this.data = {};
  }

  get (key) {
    return this.data[key];
  }

  add (key) {
    if (this.data[key]) {
      this.data[key]++;
    } else {
      this.data[key] = 1;
    }
  }

  forEach (iterator) {
    for (const key in this.data) {
      iterator(key);
    }
  }
}

let parser = new LogParser();

// find the filenames we should process
console.log("length=%d args=%s", process.argv.length, process.argv);
if (process.argv.length < 4) {
  console.log("%s [outputcsv] [files...]");
} else {
  const csv_file = process.argv[2];
  const inputs = process.argv.slice(3);

  console.log("csv=%s inputs=%s", csv_file, inputs);

  for (const k in inputs) {
    console.log("fname=%s", inputs[k]);
    parser.add_file(inputs[k]);
  }
}

// parser.add_line(bulogin_msg);
// parser.add_file("bulogin-test.txt");
// parser.add_line(buweb_msg);
parser.generate_csv();
