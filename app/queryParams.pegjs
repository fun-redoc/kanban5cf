/*
 * odata qurey grammar translation into 
 * mongoose query parameter
 * ==========================
 */

Start
 = QueryExpression / SortExpression

SortExpression
 = idProperty:Identifier _ dir:("asc" / "desc"){
   var obj = {}
   obj[idProperty] = (dir === "asc" ? 1 : -1);
   return obj;
 }

QueryExpression
  = term:QueryTerm term2:(_ "and" _ QueryTerm)* {
    var obj = term2.reduce(
      function(pv, cv) {
          for (var attrname in cv[3]) { 
              pv[attrname] = cv[3][attrname]; 
            }
            return pv;
        },
      term
    );
    return obj; 
  }

QueryTerm
  = id1:Identifier _ "eq" _ id2:(String / Bool) { 
    var obj = {}; obj[id1] = id2;
    return obj; 
  }

Bool
  = "true" / "false" { return JSON.parse(text()); }

String
  = "\'" strVal:Identifier "\'" { return strVal; }
 
Identifier
  = [a-zA-Z]+ { return text(); }
  
Integer "integer"
  = [0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*
