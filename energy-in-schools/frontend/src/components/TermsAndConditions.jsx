import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { withStyles } from '@material-ui/core/styles';
import listItemImage from '../images/list_item_blue.svg';

const styles = theme => ({
  root: {
    background: 'rgb(255, 255, 255)',
    paddingBottom: theme.spacing(4),
    borderRadius: 5,
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      borderRadius: 0,
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  headerText: {
    padding: '24px 8px',
    fontSize: 30,
    fontWeight: 900,
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      fontSize: 24,
      paddingTop: 16,
      paddingBottom: 16,
    },
  },
  subheaderText: {
    fontSize: 25,
    fontWeight: 900,
    width: '100%',
    marginBottom: 10,
  },
  articleLists: {
    maxWidth: '100%',
    '&:first-child': {
      paddingTop: 0,
    },
  },
  listSubHeader: {
    color: 'rgb(0, 188, 212)',
    fontSize: 20,
    fontWeight: 400,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    background: 'rgb(255, 255, 255)',
    lineHeight: 1.4,
    paddingBottom: 8,
    paddingTop: 8,
    position: 'relative',
  },
  olListRoot: {
    listStyleType: 'decimal',
  },
  listItemBlock: {
    alignItems: 'start',
  },
  listItem: {
    display: 'list-item',
    listStylePosition: 'inside',
    paddingLeft: 0,
    paddingRight: 0,
  },
  listItemIconRoot: {
    marginRight: 12,
    minWidth: 0,
  },
  listItemImage: {
    width: 16,
    height: 16,
    position: 'relative',
    top: 7,
  },
  listItemText: {
    textAlign: 'justify',
    overflowWrap: 'break-word',
    fontSize: 15,
  },
});

function TermsAndConditions(props) {
  const { classes } = props;

  return (
    <Grid className={classes.root} container justify="center">
      <Grid container direction="row" className={classes.headerContainer}>
        <Typography className={classes.headerText} align="center">
          Terms of Use
        </Typography>
      </Grid>
      <Grid container item sm={10}>

        <List className={classes.articleLists}>
          <ListItem className={classes.listItemBlock}>
            <ListItemText className={classes.listItemText}>
              This website is operated by MyUtilityGenius Commercial Ltd (&quot;MUGC&quot;) (Company No 08506172) of
              Unit 1 Churchill Court, 58 Station Road, North Harrow, HA2 7SA (the &quot;Company&quot;, &quot;We&quot;).
              By using our Portal, you agree to comply with and be bound by the following terms and conditions
              (the &quot;Terms of Use&quot;) together with our privacy policy. If you do not agree to these Terms of Use,
              you must not use this site. The School is granted the use the Portal following a signed agreement with the Company
              for the provision of Energy in School Service.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 1 (Purpose)</ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The Portal is a system operated by the Company and has the following purposes:
              <List component="ol" className={classes.olListRoot} dense>
                <ListItem className={classes.listItem}>
                  To provide the School a service which allows the School to monitor it’s energy usage for the purpose of pupil’s learning;
                </ListItem>
                <ListItem className={classes.listItem}>
                  To provide the School with a service which allows the School to monitor it’s energy usage with a view to assist the School with managing it’s energy usage
                </ListItem>
                <ListItem className={classes.listItem}>
                  For the School to develop lesson plans using the material provided in the Platform to help pupils learn about the link between climate change and energy use and how to reduce energy use;
                </ListItem>
                <ListItem className={classes.listItem}>
                  To provide required information to energy supplier to enable them to provide the School with energy quotes and subsequently to contract with one of the energy suppliers
                </ListItem>
                <ListItem className={classes.listItem}>
                  To provide relevant information to other service providers who we deem to be able to offer the School other services that the School may wish to optionally evaluate;
                </ListItem>
              </List>
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 2 (Definitions)</ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              <strong>&quot;EiSS&quot;</strong> or <strong>&quot;Energy in School Service&quot;</strong>
              is a service provided by the Company and its affiliates that a School may procure.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              <strong>&quot;Portal&quot;</strong> or <strong>&quot;site&quot;</strong> or &quot;Website&quot; is reference
              to this website that is the property of the Company and only the Company has the right to grant its
              use under this Terms of Use.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              &quot;Equipment&quot; or &quot;Devices&quot; is all equipment that may be provided by the Company or its
              partners as part of the EiSS agreement such as, but not limited, to display device, SmartThings devices, microbits.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              Definitions of other terms used in this Terms of Use shall follow the relevant laws and regulations and
              commercial practices.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 3 (Application and Revision of School
            Agreement)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              We reserve the right to amend these Terms of Use from time to time. Any changes will be posted on
              this Website. Your continued use of this Website after posting will constitute your acceptance of,
              and agreement to, any changes. This Terms of Use shall be applied to existing Schools who participated
              in the energy in school trial system (&quot;ETS&quot;) , unless such revised Terms of Use violates the relevant
              laws and regulations and there is a separate transitional provision. In the event that the School does
              not consent to the revised Terms of Use, the school is entitled to withdraw its membership in accordance
              with Article 6.. Any matters not specified in this Terms of Use, and the interpretation of the contents
              of this Terms of Use, shall follow the relevant laws, regulations and commercial practices.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 4 (School’s use of the Portal)</ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              This Terms of Use shall become effective when a potential school applies for registration and the Company accepts
              such application for registration. The School, at any time, may withdraw from the use of the Portal by giving notice
              of withdrawal to the Company by sending an e-mail to support@myutilitygenius.co.uk
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>
            Article 5 (Responsibility to manage personal information and the
            Company’s authority to amend and delete information)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The School shall provide information about the school in good faith based on the facts, and shall be liable for any damage due
              to the provision of incorrect or inaccurate content. In principle, all information about the school provided shall be done so by
              the School itself, and the School may access or change the information at any time. In the event that any content of the information
              about the school registered by the School violates social norms, the Company may change or delete such content at any time.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 6 (Viruses)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              While we will monitor the Website on a regular basis we do not guarantee that the Website will be secure or free from bugs or viruses.
              You are responsible for configuring your information technology, computer programme and platform, as appropriate, in order to access the Website.
              You should use your own virus protection software. You must not misuse the Website by knowingly introducing viruses, trojans, worms, logic bombs
              or other material which is malicious or technologically harmful. You must not attempt to gain unauthorised access to the Website, the server on which
              the Website is stored or any server, computer or database connected to the Website. We will not be liable for any loss or damage caused by a virus,
              distributed denial-of-service attack, or other technologically harmful material that may infect your computer equipment, computer programs, data or
              other proprietary material due to your use of our site or to your or any person using the Website on your behalf downloading of any content on it, or
              on any website linked to it.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 7 (Responsibility for management of School ID and
            Password)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The School may use the Portal by accessing the Portal with his or her School IDs and Passwords for different user roles. The School shall be responsible
              for managing his or her School ID and Password, and shall not assign or share his or her School ID or Password for others to use them.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The Company shall not be liable for any disclosure of the School ID and Password not caused by the Company’s intentional act or negligence, and thus shall
              not be liable for any damage resulting from such disclosure.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 8 (Protection of Information)</ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The Company shall collect data on:
              <List component="ol" className={classes.olListRoot} dense>
                <ListItem className={classes.listItem}>
                  School building level total power (electric) consumption every 6 seconds or any other frequency as is
                  unilaterally determined by the Company and its affiliates.
                </ListItem>
                <ListItem className={classes.listItem}>
                  School building gas consumption every 30 seconds or any other frequency as is unilaterally determined
                  by the Company and its affiliates.
                </ListItem>
                <ListItem className={classes.listItem}>
                  School floor plans uploaded by the user
                </ListItem>
                <ListItem className={classes.listItem}>
                  School address, energy usage history, metering details, current supplier details; school
                  bank details (if the school switches energy supplier via the portal), energy manager phone
                  number or email (if they choose to set-up energy or temperature alerts via the platform)
                </ListItem>
              </List>
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The Company shall use the services of an external service provider to collect building level total power
              (electric) and gas consumption data from the school’s Smart Energy meters. The Company shall provide information
              about the external service provider upon written request from the School.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              Any personal data that you provide via the Website will be governed by our privacy policy.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 9 (Obligations of School)</ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The School shall comply with notifications given by the Company from time to time with respect
              to this Terms of Use and the relevant laws and regulations. The School shall not copy, reproduce
              or change information obtained using the Portal, nor provide others with such information without
              the prior consent of the Company.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The School shall not commit any of the following acts with respect to the use of Portal.
              <List component="ol" className={classes.olListRoot} dense>
                <ListItem className={classes.listItem}>
                  Illegal use of another’s School ID or Password
                </ListItem>
                <ListItem className={classes.listItem}>
                  Defamation or slander of others, including the Company, its employees and its officers
                </ListItem>
                <ListItem className={classes.listItem}>
                  Posting advertising materials without the prior approval of the Company, or continuous
                  transmission of advertising mail or spam against the will of others
                </ListItem>
                <ListItem className={classes.listItem}>
                  Any act violating the relevant laws and regulations
                </ListItem>
              </List>
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The School shall have all rights and responsibilities for any and all contents posted by him or her
              through the Portal. In the event that the content of any posting falls under the categories defined in
              Paragraph 3 of this Article, the Company may delete it without giving prior notice to or obtaining the
              consent of the School.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 10 (Roles and Responsibilities of the
            Company)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The Company will strive to provide continuous, stable and reliable Portal to the School.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The Company shall indemnify the ETS School against any damages arising from a fraudulent act
              by the Company. Notwithstanding the foregoing, the Company shall not be liable for any interruption
              or breakdown of the system specified in Article 11.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 11 (Interruption of operation of Portal and System breakdown)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The Company may temporarily interrupt the provision of the service for various reasons,
              such as repair and inspection or exchange of computation device, including computers or
              hacking, etc.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              In the event that the Company deems that it is impossible to conduct a test due to a
              system breakdown that is beyond the control of the Company, the Company may take any
              measures necessary, such as cancellation of testing contents already entered or input. A
              system breakdown means that it is impossible to access the ETS due to a system failure
              or a malfunction of the network connected to the system, or that it is impossible to receive
              or transmit a problem registration.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              If a failed entry of problem registration in the ETS is due to a malfunction of the School’s
              network or a breakdown by the network service provider, failure of the School’s system,
              etc., rather than due to a system breakdown specified in Paragraph 2 of this Article, such
              a failed entry is considered a non-transmission by the School.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 13 (Ownership of Copyrights and Limitation of Use)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              Copyright and all other intellectual property rights to the works made by the Company and it’s affiliates shall
              be owned by the Company and it’s affiliates. The School shall not use information obtained during the use of the
              Portal nor cause any third party to use such information for any purpose by means of reproduction, transmission,
              publication, distribution, broadcasting, or other methods without the prior approval of the Company.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The School shall not use information obtained during the use of the service, nor cause
              any third party to use such information for purposes other than sales of products or
              services, by means of reproduction, transmission, publication, distribution, broadcasting,
              or other methods without the prior approval of the Company.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The Portal and any necessary software used in connection with the system (&quot;Software&quot;) contain
              proprietary and confidential information that is protected by applicable intellectual property and
              other laws. No content from the Portal other than your own electricity consumption data  can be copied,
              captured or quoted in any manner without the express written permission of the Company. Please contact
              us at support@myutilitygenius.co.uk if you wish to make such a request.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              Decompilation, reverse engineering or re-engineering of any nature, or attempting to do
              so is strictly forbidden.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 14 (Investigation & Complaint Process)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              For any complaint about material posted about the Portal, please send an email to support@myutilitygenius.co.uk.
              The Company cannot guarantee your issue will be dealt with promptly if any other mechanism is used.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The Company reserves the right to investigate suspected violations of these Terms of
              Use. This could involve gathering data from trial participants, the Company facilities, other
              service providers and the complainant. If such an investigation is required and while it is
              under investigation, the Company is within its rights to suspend the suspect account and
              either temporarily or permanently remove the material involved from the ETS.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The Company may be bound by current or future legal statutes, such as the Regulation of
              Investigatory Powers Act 2000 to access, monitor, store, take copies of, or otherwise deal
              with the members’ data stored the service. Without limitation, you expressly authorise the
              Company to use personal data and other account information in connection with any such
              investigation, including disclosure to any third party authority that is considered to possess
              a legitimate interest in any such investigation or its outcome.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 15 (Assignment)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The Company reserves the right to assign this contract at any time whether in whole or in
              part. You do not have the right to assign but can withdraw as per Article 4 after 1 year from
              the effective date of commencing the use of the Portal by contacting us at support@myutilitygenius.co.uk.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 15 (Jurisdiction)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              These Terms of Use are governed by English law and under the jurisdiction of English courts.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              If any of these Terms of Use are determined to be invalid or unenforceable pursuant to
              applicable law including, but not limited to, the Limitation of Liability and the Disclaimer of
              Warranties clauses at the end of this document, then the invalid or unenforceable
              provision will be deemed as having been superseded by a valid, enforceable provision
              which most closely matches the intent of the original provision and the remainder of the
              Terms of Use shall continue in effect.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 16 (Liability and Indemnity)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              You agree to indemnify and hold the Company, and its subsidiaries, affiliates, officers,
              agents, co-branders or other partners, and employees, harmless from any claim or
              demand, including reasonable lawyers’ fees, made by any third party due to or arising out
              of your content, your use of the Company ETS and the Test Equipment, your connection
              to the service, your violation of the Terms of Use, or your violation of any rights of another.
            </ListItemText>
          </ListItem>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              Our Terms and Conditions do not affect your statutory rights.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 17 (DISCLAIMER OF WARRANTIES)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              You expressly understand and agree that the energy trial service, software,
              documentation and any associated materials are provided on an ‘as is’ basis with no
              warranties whatsoever. The company and their suppliers expressly disclaim all warranties
              of any kind to the fullest extent permitted by law whether express, implied or statutory
              warranties, including but not limited to the warranties of (a) merchantability, (b) fit for a
              particular purpose, (c) non-infringement, (d) reliability, (e) interuption of service, (f)
              timeliness, (g) performance or (h) error free. Samsung disclaim any warranties regarding
              (a) the service meeting your requirements, (b) any information or advice obtained through
              the ets, (c) quality of any goods, services, information or other materials received or
              purchased through the service, (d) any errors will be corrected. You understand and agree
              that any material downloaded or obtained through the use of the energy trial service is at
              your own discretion and risk and that you are solely responsible for any damages to your
              computer system or loss of data that results from the download of such material or data.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Article 18 (LIMITATION OF LIABILITY)
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              You expressly understand and agree that the company will in no way be liable for any
              damages whatsoever, including but not limited to any direct, indirect, consequential,
              incidental, punitive, exemplary, or special damages, or damages including but not limited
              to loss of profits, data, loss of use, goodwill or any other intangibles (even if we have been
              advised of the possibility of such damages) resulting from or arising out of (a)
              procurement cost of substitute goods and/or services, (b) inability or use of the service, (c)
              unauthorised access to or alteration of your transmissions or data, (d) unauthorised use,
              (e) any performance or non-performance issue relating to the service and (f) any other
              matter relating to the service.
            </ListItemText>
          </ListItem>
        </List>

        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Supplementary Provision
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              This School Agreement shall be effective from 09 May, 2022.
            </ListItemText>
          </ListItem>
        </List>

      </Grid>
    </Grid>
  );
}

TermsAndConditions.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TermsAndConditions);
