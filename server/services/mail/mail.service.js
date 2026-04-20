//server/services/mail/mail.service.js
import resend from "../../configs/mail.config.js";
import { MAIL_TYPES } from "./mail.constant.js";

import { tenantRegisterAdminTemplate } from "../../templates/tenantRegisterAdmin.template.js";
import { tenantWelcomeTemplate } from "../../templates/tenantWelcome.template.js";
import { tenantApprovedTemplate } from "../../templates/tenantApproved.template.js";
import { tenantInactiveTemplate } from "../../templates/tenantInactive.template.js";
import { tenantBlockedTemplate } from "../../templates/tenantBlocked.template.js";
import { tutorAddedTemplate } from "../../templates/tutorAdded.template.js";
import { studentAddedTemplate } from "../../templates/studentAdded.template.js";
import { classAssignedTutorTemplate } from "../../templates/classAssignedTutor.template.js";
import { classAssignedStudentTemplate } from "../../templates/classAssignedStudent.template.js";
import { passwordResetTemplate } from "../../templates/passwordReset.template.js";
import { classReminderStudentTemplate } from "../../templates/classReminderStudentTemplate.js";
import { classReminderTutorTemplate } from "../../templates/classReminderTutorTemplate.js";

// Use your verified Resend domain here.
// Until you verify a domain, use: "onboarding@resend.dev" (only sends to your own email)
// After verifying your domain: "Tutorial App <no-reply@yourdomain.com>"
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

export const sendTenantMail = async (type, tenant, options = {}) => {
  try {
    let mailData;
    let recipient;

    console.log(
      `[Mail Service] Preparing email | type: ${type} | to: ${tenant?.email}`,
    );

    switch (type) {
      case MAIL_TYPES.TENANT_REGISTER_ADMIN:
        mailData = tenantRegisterAdminTemplate(tenant);
        recipient = process.env.ADMIN_EMAIL;
        break;

      case MAIL_TYPES.TENANT_WELCOME:
        mailData = tenantWelcomeTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.TENANT_APPROVED:
        mailData = tenantApprovedTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.TENANT_INACTIVE:
        mailData = tenantInactiveTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.TENANT_BLOCKED:
        mailData = tenantBlockedTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.TUTOR_ADDED:
        mailData = tutorAddedTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.STUDENT_ADDED:
        mailData = studentAddedTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.CLASS_ASSIGNED_TUTOR:
        mailData = classAssignedTutorTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.CLASS_ASSIGNED_STUDENT:
        mailData = classAssignedStudentTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.CLASS_REMINDER_STUDENT:
        mailData = classReminderStudentTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.CLASS_REMINDER_TUTOR:
        mailData = classReminderTutorTemplate(tenant);
        recipient = tenant.email;
        break;

      case MAIL_TYPES.PASSWORD_RESET:
        mailData = passwordResetTemplate(tenant, options.resetLink);
        recipient = tenant.email;
        break;

      default:
        throw new Error(`Invalid Mail Type: ${type}`);
    }

    if (!recipient) {
      throw new Error(`Recipient email is missing for mail type: ${type}`);
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject: mailData.subject,
      html: mailData.html,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log(
      `[Mail Service] ✅ Email sent | type: ${type} | to: ${recipient} | id: ${data.id}`,
    );
  } catch (error) {
    console.error(
      `[Mail Service] ❌ Email failed | type: ${type} | error: ${error.message}`,
    );
  }
};
