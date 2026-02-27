import { GraphQLError } from "graphql";

const exportedMethods = {
 errorCheckString(p_str) {
  if (!p_str) throw new GraphQLError("ERROR: String Must Be Provided", {
    extensions: { code: "STRING_NOT_PROVIDED" }
  });
 
  if (typeof p_str !== "string")
    throw new GraphQLError("ERROR: Value Must Be A String", {
      extensions: { code: "INVALID_STRING_TYPE" }
    });

  if (p_str.trim().length === 0)
    throw new GraphQLError("ERROR: No Empty String or Only Spaces", {
      extensions: { code: "EMPTY_STRING_PROVIDED" }
    });

  return p_str;
 },
 errorCheckDates(p_date){
  //All dates below must be valid MM/DD/YYYY strings.
  p_date = this.errorCheckString(p_date);

   if (!p_date || isNaN(new Date(p_date))) {
        throw new GraphQLError("Invalid date format for date_signed. Please use MM/DD/YYYY format.", {
          extensions: { code: "INVALID_DATE_FORMAT" },
        });
      }

  const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
  if (!dateRegex.test(p_date)) {
    throw new GraphQLError("ERROR: Invalid Date Format. Expected MM/DD/YYYY", {
      extensions: { code: "INVALID_DATE_FORMAT" }
    });
  }

  

  return p_date;
 },

 errorCheckDateRange(p_start, p_end) {
  const startDate = new Date(this.errorCheckDates(p_start));
  const endDate = new Date(this.errorCheckDates(p_end));
  if (startDate > endDate) {
    throw new GraphQLError("ERROR: Start date must be before end date", {
      extensions: { code: "INVALID_DATE_RANGE" }
    });
  }
},
 errorCheckEmail (p_email) {
    p_email = this.errorCheckString(p_email);
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(p_email)) {
      throw new GraphQLError("ERROR: Invalid Email Format", {
        extensions: { code: "INVALID_EMAIL_FORMAT" }
      });
    }
    return p_email
  },

errorCheckPhoneNumber (p_phone) {
  p_phone = this.errorCheckString(p_phone);
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  if (!phoneRegex.test(p_phone)) {
    throw new GraphQLError("ERROR: Invalid Phone Number Format", {
      extensions: { code: "INVALID_PHONE_FORMAT" }
    });

  }
  return p_phone;
},

errorCheckTrackCount (p_trackCount) {
  if (typeof p_trackCount !== "number" || !Number.isInteger(p_trackCount) || p_trackCount <= 0) {
    throw new GraphQLError("ERROR: Track count must be a positive integer", {
      extensions: { code: "INVALID_TRACK_COUNT" }
    });
  }
  return p_trackCount;
}
};
export default exportedMethods;