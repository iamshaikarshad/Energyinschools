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
  ulListRoot: {
    listStyleType: 'disc',
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
  table: {
    borderCollapse: 'collapse',
    width: '100%',
  },
  tableData: {
    border: '1px solid black',
    borderCollapse: 'collapse',
    justify: 'center',
    padding: 5,
  },
});

function PrivacyPolicy(props) {
  const { classes } = props;

  return (
    <Grid className={classes.root} container justify="center">
      <Grid container direction="row" className={classes.headerContainer}>
        <Typography className={classes.headerText} align="center">
          Energy in Schools Project Privacy Policy (“Privacy Policy”)
        </Typography>
      </Grid>
      <Grid container item sm={10}>
        <List className={classes.articleLists}>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              Effective: 09 May 2022.
            </ListItemText>
          </ListItem>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              MyUtilityGenius Commercial Limited (<strong>&quot;MUGC&quot;</strong>, <strong>&quot;we&quot;</strong>, <strong>&quot;us&quot;</strong>, <strong>&quot;our&quot;</strong>)
              knows how important individual privacy is, and we strive to be clear about how we collect, use, disclose, transfer and store your information.
              This Privacy Policy describes the ways in which we collect and use your information as part of the Energy
              in Schools Service(the &quot;EiSS&quot;). MUGC is the data controller for the processing of personal data in relation to EiSS.
            </ListItemText>
          </ListItem>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              It is important that you check the Energy in Schools Portal (the &quot;Portal&quot;):  https://www.energyinschools.co.uk often for updates
              to the Privacy Policy. You may check the “effective date” posted at the top to see when the Privacy Policy was last updated.
            </ListItemText>
          </ListItem>
        </List>
        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>What information do we collect about you?</ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              If you are a participant, we may collect and process the following information as part of EiSS
              (“<strong>Personal Data</strong>”):
              <List component="ul" className={classes.ulListRoot} dense>
                <ListItem className={classes.listItem}>
                  Information you provided to MUGC when you registered your school’s interest in the Portal
                  via <a href="https://www.energyinschools.co.uk">www.energyinschools.co.uk</a>: name, email address,
                  school postal address and phone number;
                </ListItem>
                <ListItem className={classes.listItem}>
                  Any communications that you send or deliver to us, or make available via the Portal;
                </ListItem>
                <ListItem className={classes.listItem}>
                  Technical data, such as IP addresses and device IDs necessary to render the Portal and data
                  derived from cookies as explained in the section on cookies.
                </ListItem>
              </List>
            </ListItemText>
          </ListItem>
        </List>
        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>
            How do we use your Personal Data?
          </ListSubheader>

          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              We process your Personal Data for the purposes set out below on the basis of your consent which we will
              ask for separately when you register your interest. You may withdraw your consent at any time by contacting
              us as specified in the Contact section of this Privacy Policy, however this may affect your ability to participate
              in the EiSS and receive services through it. Withdrawing your consent will not affect the lawfulness of processing
              based on your consent before the withdrawal.
            </ListItemText>
          </ListItem>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              If you are a participant, we use your Personal Data for the following purposes:
              <List component="ul" className={classes.ulListRoot} dense>
                <ListItem className={classes.listItem}>
                  To provide you with a service which allows you to monitor your school’s energy usage for the purpose of pupil’s learning;
                </ListItem>
                <ListItem className={classes.listItem}>
                  To provide you with a service which allows you to monitor your school’s energy usage with a view to assist you with managing
                  your school’s energy usage
                </ListItem>
                <ListItem className={classes.listItem}>
                  For the school to develop lesson plans using the material provided in the Platform to help pupils learn about the link between
                  climate change and energy use and how to reduce energy use;
                </ListItem>
                <ListItem className={classes.listItem}>
                  To provide required information to energy supplier to enable them to provide your school with energy quotes and subsequently to
                  contract with one of the energy suppliers
                </ListItem>
                <ListItem className={classes.listItem}>
                  To provide relevant information to other service providers who we deem to be able to offer your school other services that you may wish
                  to optionally evaluate;
                </ListItem>
                <ListItem className={classes.listItem}>
                  To improve and develop new services and technologies relating to energy use;
                </ListItem>
                <ListItem className={classes.listItem}>
                  Otherwise where we have obtained your specific consent.
                </ListItem>
              </List>
            </ListItemText>
          </ListItem>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              We also use certain Personal Data for our legitimate interests, such as to safeguard the security of
              the services we provide.
            </ListItemText>
          </ListItem>
        </List>
        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>To whom do we disclose your Personal Data?</ListSubheader>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              We do not disclose your Personal Data to third parties for their own independent marketing or
              business purposes without your separate consent. However, we may share your Personal Data with
              the following entities:
              <List component="ul" className={classes.ulListRoot} dense>
                <ListItem className={classes.listItem}>
                  MUGC employees that will have access to the information in connection with their job responsibilities
                  or contractual obligations;
                </ListItem>
                <ListItem className={classes.listItem}>
                  MUGC affiliates, for the purposes described above;
                </ListItem>
                <ListItem className={classes.listItem}>
                  Our project partners Centre for Sustainable Energy, Lancaster University and My Utility
                  Genius to help you use the platform and services, and to evaluate the success of the project;
                </ListItem>
                <ListItem className={classes.listItem}>
                  Other parties: (i) if we are required to do so by law or legal process (such as a court
                  order or subpoena); (ii) in response to requests by government agencies, such as law
                  enforcement authorities; (iii) to establish, exercise or defend our legal rights; (iv) when
                  we believe disclosure is necessary or appropriate to prevent physical or other harm; (v)
                  in connection with an investigation of suspected or actual illegal activity; or (vi) in the
                  event we sell or transfer all or a portion of our business or assets (including in the event
                  of a merger, acquisition, reorganization, dissolution or liquidation);
                </ListItem>
                <ListItem className={classes.listItem}>
                  With other third parties when you consent to, or request such sharing.
                </ListItem>
              </List>
            </ListItemText>
          </ListItem>
        </List>
        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>How do we keep your Personal Data secure?</ListSubheader>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              We have put in place appropriate physical and technical measures to safeguard the Personal Data we collect
              in connection with the EiSS from accidental, unlawful or unauthorised destruction, interference, loss, alteration,
              access, disclosure or use.
            </ListItemText>
          </ListItem>
        </List>
        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>International transfer of Personal Data</ListSubheader>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              Personal data is not transferred outside of the UK and EEA.
            </ListItemText>
          </ListItem>
        </List>
        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>What are your rights?</ListSubheader>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              Subject to limitations in applicable data protection laws, you have the right to request access
              to or rectification of the personal data which we hold about you. You also have the right to
              portability of or erasure of the Personal Data we hold about you and the right to object to or
              restrict the data processing we do about you, however, this may impact on your ability to participate
              in the EiSS and receive services through it. We will comply with your request promptly and in accordance
              with the relevant legislation. If you would like to make any such request, please contact us as specified
              in the Contact section of this Privacy Policy.
            </ListItemText>
          </ListItem>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              Please help us to ensure that the information we hold about you is accurate and up to date. If you
              think that any information we have about you is incorrect or incomplete, please contact us in the
              manner set out below. We will correct or update any information about you as soon as reasonably
              possible.
            </ListItemText>
          </ListItem>
        </List>
        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>How long do we keep your Personal Data?</ListSubheader>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              We will only keep your personal information as long as we need it for the reason that it was
              originally collected. Your information will be destroyed or erased from our systems when we don&#39;t
              need it anymore.
            </ListItemText>
          </ListItem>
        </List>
        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Cookies</ListSubheader>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              Our website uses cookies to distinguish you from other users of our website. This helps us to provide
              you with a good experience when you browse our website and also allows us to improve our site.
            </ListItemText>
          </ListItem>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              A cookie is a small file of letters and numbers that we store on your browser or the hard drive of
              your computer if you agree. Cookies contain information that is transferred to your computer’s hard
              drive.<br />
              We use the following cookies:
              <List component="ul" className={classes.ulListRoot} dense>
                <ListItem className={classes.listItem}>
                  <strong>Analytical or performance cookies.</strong>
                  These allow us to recognise and count the number of visitors and to see
                  how visitors move around our website when they are using it.
                  This helps us to improve the way our website works, for example,
                  by ensuring that users are finding what they are looking for easily.
                </ListItem>
                <ListItem className={classes.listItem}>
                  <strong>Advertising / Targeting Cookies.</strong>
                  These cookies gather information about your browser habits.
                  They remember that you’ve visited our website and share this information with other
                  organizations such as advertisers.
                </ListItem>
              </List>
            </ListItemText>
          </ListItem>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              You can find more information about the individual cookies we use and the purposes for which we
              use them in the table below:
              <table className={classes.table}>
                <tr>
                  <td className={classes.tableData}>Cookie</td>
                  <td className={classes.tableData}>Description</td>
                  <td className={classes.tableData}>Duration</td>
                  <td className={classes.tableData}>Type of cookie</td>
                </tr>
                <tr>
                  <td className={classes.tableData}><strong>Google Analytics</strong></td>
                  <td className={classes.tableData}>
                    Google Analytics is a web analytics service offered by Google that
                    tracks and reports website traffic.
                  </td>
                  <td className={classes.tableData}>Persistent. </td>
                  <td className={classes.tableData}>Analytical or Performance</td>
                </tr>
                <tr>
                  <td className={classes.tableData}>_ga</td>
                  <td className={classes.tableData}>
                    This cookie is installed by Google Analytics.
                    The cookie is used to calculate visitor, session, campaign data and keep track of site usage
                    for the site’s analytics report. The cookies store information anonymously and assigns
                    a randomly generated number to identify unique visitors.
                  </td>
                  <td className={classes.tableData}>2 years</td>
                  <td className={classes.tableData}>Analytical or Performance</td>
                </tr>
                <tr>
                  <td className={classes.tableData}>_gid</td>
                  <td className={classes.tableData}>
                    This cookie is installed by Google Analytics. The cookie is used to store information
                    of how visitors use a website and helps in creating an analytics report of how the
                    website is going. The data collected including the number of visitors,
                    the source where they have come from and the pages visited in an anonymous form.
                  </td>
                  <td className={classes.tableData}>1 day</td>
                  <td className={classes.tableData}>Analytical or Performance</td>
                </tr>
                <tr>
                  <td className={classes.tableData}>1P_JAR</td>
                  <td className={classes.tableData}>A Google Analytics cookie used to collect site statistics and track conversion rates.</td>
                  <td className={classes.tableData}>30 days</td>
                  <td className={classes.tableData}>Analytical or Performance</td>
                </tr>
              </table>
            </ListItemText>
          </ListItem>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              You can change your cookie preferences at any time by going to the <strong>cookies manager</strong> at
              the bottom of the page on the Energy in Schools portal.
            </ListItemText>
          </ListItem>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              You can also block cookies by activating the setting on your browser that allows you to refuse the
              setting of all or some cookies. However, if you use your browser settings to block all cookies
              (including essential cookies) you may not be able to access all or parts of our website.
            </ListItemText>
          </ListItem>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              The energy in schools website includes a coding editor within an iframe
              - <a href="https://energyinschools.co.uk/editor">https://energyinschools.co.uk/editor</a>.
              This editor is the makecode editor
              - <a href="https://makecode.microbit.org/">https://makecode.microbit.org/</a>. For details of the cookies
              used by the makecode editor please see the Cookies section of the Microsoft privacy website
              - <a href="https://privacy.microsoft.com/en-gb/privacystatement/">https://privacy.microsoft.com/en-gb/privacystatement/</a>
            </ListItemText>
          </ListItem>
        </List>
        <List className={classes.articleLists}>
          <ListSubheader className={classes.listSubHeader}>Contact</ListSubheader>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              If you have any questions regarding this Privacy Policy, please contact us at:<br /><br />
              Data Officer<br />
              MyUtilityGenius Commercial Limited<br />
              Unit 1 Churchill Court, 58 Station Road, North Harrow, Middlesex, HA2 7NA<br /><br />
              Or<br /><br />
              Please email us at: <a href="mailto:support@myutilitygenius.co.uk">support@myutilitygenius.co.uk</a> or&#160;
            </ListItemText>
          </ListItem>
          <ListItem className={classes.listItemBlock}>
            <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
              <img src={listItemImage} className={classes.listItemImage} alt="list item" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>
              MUGC is regulated by the Information Commissioner’s Office (“ICO”). If you would like to report a concern or lodge
              a complaint in relation to MUGC’s handling of your personal data you can contact the ICO.
            </ListItemText>
          </ListItem>
        </List>
      </Grid>
    </Grid>
  );
}

PrivacyPolicy.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PrivacyPolicy);
