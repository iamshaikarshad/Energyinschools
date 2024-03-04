import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { withStyles } from '@material-ui/core/styles';
import listItemImage from '../../images/list_item_blue.svg';

const styles = {
  root: {
    background: 'rgb(255, 255, 255)',
    padding: '50px 5px',
    maxWidth: '100%',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 900,
    width: '100%',
  },
  subheaderText: {
    fontSize: 25,
    fontWeight: 900,
    width: '100%',
    marginBottom: 10,
  },
  articleLists: {
    maxWidth: '100%',
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
    marginRight: 0,
  },
  listItemImage: {
    width: 16,
    height: 16,
    position: 'relative',
    top: 4,
  },
  listItemText: {
    textAlign: 'justify',
    overflowWrap: 'break-word',
    fontSize: 15,
  },
};

const SchoolAgreement = ({ classes }) => (
  <Grid className={classes.root} container justify="center">
    <Grid container direction="row" className={classes.headerContainer}>
      <Typography className={classes.headerText} align="center">
        School Agreement
      </Typography>
      <Typography className={classes.subheaderText} align="center">
        Energy Trial System
      </Typography>
    </Grid>
    <Grid container item sm={12}>
      <List className={classes.articleLists}>
        <ListSubheader className={classes.listSubHeader}>Article 1 (Purpose)</ListSubheader>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            This School Agreement for Energy Trial System (hereinafter &#34;School Agreement&#34;) aims to set forth the
            rights, obligations and responsibilities of &#34;Company&#34; and &#34;School&#34; (defined separately) with
            respect to the School&rsquo;s use of the Energy Trial System (hereinafter &#34;ETS&#34;) operated by Samsung
            Electronics (UK) Limited (hereinafter &#34;Company&#34;).
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
            The ETS is a system constructed and operated by the Company for mutual cooperation between the Company and
            the School. ETS has the following purposes:
            <List component="ol" className={classes.olListRoot} dense>
              <ListItem className={classes.listItem}>
                To generate data to develop new energy services
              </ListItem>
              <ListItem className={classes.listItem}>
                To trial new energy services and check the problems recorded by a tester (current state/statistics)
              </ListItem>
              <ListItem className={classes.listItem}>
                To trial new IoT coding teaching services and check the problems recorded by a tester (current
                state/statistics)
              </ListItem>
              <ListItem className={classes.listItem}>
                To convey public notices and share information regarding service testing (forum)
              </ListItem>
            </List>
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            &#34;School&#34; is an educational establishment who has been finally approved by the Company after passing
            all necessary procedures required for school registration, such as consent to this School Agreement
            regarding the ETS, and the provision of diverse information requested by the Company.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            &#34;Test Equipment&#34; is all equipment provided by the company for use in the School Trial including
            Samsung Devices (Samsung display, SmartThings devices and Samsung flip).
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Definitions of other terms used in this School Agreement shall follow the relevant laws and regulations and
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
            This School Agreement shall be effective upon the consent of the School during school registration.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            From time to time, the Company may revise this School Agreement to promote the smooth operation
            of &#34;ETS.&#34; In
            the event that the Company revises this School Agreement, it shall post the effective date and the reasons
            for revision along with the current school agreement on the front page of the &#34;ETS&#34; website for a
            period from seven (7) days before the effective date to the day before the effective date. Notwithstanding
            the
            foregoing, in the event of an emergency, the Company may post a public notice and apply the revised school
            agreement immediately.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The School Agreement revised in accordance with Article 3, Paragraph 2 shall be applied to Schools who have
            already registered before the applicable revision, unless such revised School Agreement violates the
            relevant laws and regulations and there is a separate transitional provision.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            In the event that the School does not consent to the revised School Agreement, the school is entitled to
            withdraw its membership in accordance with Article 5, Paragraph 1. Any failure to make objections by the day
            before the date of application shall be deemed as a consent to the revised School Agreement.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Any matters not specified in this School Agreement, and the interpretation of the contents of this School
            Agreement, shall follow the relevant laws, regulations and commercial practices.
          </ListItemText>
        </ListItem>
      </List>

      <List className={classes.articleLists}>
        <ListSubheader className={classes.listSubHeader}>Article 4 (School Registration Procedure)</ListSubheader>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The &#34;ETS&#34; use contract shall become effective when a potential school applies for registration and
            the Company accepts such application for registration.
          </ListItemText>
        </ListItem>
      </List>

      <List className={classes.articleLists}>
        <ListSubheader className={classes.listSubHeader}>Article 5 (Responsibility to manage personal information and
          the Company&rsquo;s authority to amend and delete information)
        </ListSubheader>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The School shall provide information about the school in good faith based on the facts, and shall be liable
            for any damage due to the provision of incorrect or inaccurate content.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            In principle, all information about the school provided shall be done so by the School itself, and the
            School may access or change his or her personal information at any time.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            In the event that any content of the information about the school registered by the School violates social
            norms, the Company may change or delete such content at any time.
          </ListItemText>
        </ListItem>
      </List>

      <List className={classes.articleLists}>
        <ListSubheader className={classes.listSubHeader}>Article 6 (School Withdrawal, Disqualification and Completion)
        </ListSubheader>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            School Withdrawal
            <List component="ol" className={classes.olListRoot} dense>
              <ListItem className={classes.listItem}>
                The School, at any time, may withdraw from membership in the service by giving notice of withdrawal to
                the Company by sending an e-mail to smartenergy@samsung.com. Notwithstanding the foregoing, in the event
                that the School fails to return the Test Equipment before his or her withdrawal, such withdrawal shall
                only be effective after the full return of the Test Equipment.
              </ListItem>
              <ListItem className={classes.listItem}>
                When the School gives a notice of withdrawal to the Company, the Company may go through a confirmation
                process.
              </ListItem>
              <ListItem className={classes.listItem}>
                The &#34;ETS&#34; use contact between the School and the Company shall be terminated upon the withdrawal
                of the School.
              </ListItem>
              <ListItem className={classes.listItem}>
                If the School withdraws from the trial before Trial Completion then the Company may request return of
                the Test Equipment.
              </ListItem>
            </List>
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            School Disqualification
            <List component="ol" className={classes.olListRoot} dense>
              <ListItem className={classes.listItem}>
                The Company may disqualify the School in any of the following circumstances:
                <List component="ol" className={classes.olListRoot} dense>
                  <ListItem className={classes.listItem}>
                    When it is found that the School is a false subscriber
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    When the School makes fraudulent use of another&rsquo;s ID or password, or provides another person with
                    his or her own ID or password
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    When the School fails to comply with a testing request made by the Company for an extended period of
                    time
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    When the School prevents smooth operation of the service provided by the Company (including and not
                    limited to by disconnecting any of the Trial Equipment or preventing the transmission of data from
                    the Trial Equipment)
                  </ListItem>
                  <ListItem className={classes.listItem}>
                    When the School violates any obligation of this Agreement
                  </ListItem>
                </List>
              </ListItem>
              <ListItem className={classes.listItem}>
                In the occurrence of any cause aforementioned, the Company will give a notice specifying the facts and
                the reasons for disqualification to the School via e-mail. In such a case, the &#34;ETS&#34; use
                contract
                between the School and the Company shall be terminated.
              </ListItem>
              <ListItem className={classes.listItem}>
                If the School is disqualified from the trial before Trial Completion then the Company may request return
                of the Test Equipment.
              </ListItem>
            </List>
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The Company shall not be liable for any damage to the School caused by his/her disqualification under
            Paragraph 2 of this provision.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Trial completion
            <List component="ol" className={classes.olListRoot} dense>
              <ListItem className={classes.listItem}>
                The trial completion date shall be eighteen months from the date of a School’s registration.
              </ListItem>
              <ListItem className={classes.listItem}>
                At the trial completion date, all remaining Schools (who have not withdrawn or been disqualified) may
                keep the Trial Equipment.
              </ListItem>
              <ListItem className={classes.listItem}>
                The Company may choose to extend the testing of the ETS, in which case it will ask Schools whether they
                wish to continue to test the ETS; Schools who decline may still keep the Trial Equipment.
              </ListItem>
            </List>
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
            The School may use the ETS by accessing the ETS with his or her School IDs and Passwords for different user
            roles.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The School shall be responsible for managing his or her School ID and Password, and shall not assign his or
            her School ID or Password, nor allow others to use them.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The Company shall not be liable for any disclosure of the School ID and Password not caused by the
            Company&rsquo;s
            intentional act or negligence, and thus shall not be liable for any damage resulting from such disclosure.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The School will be asked to create a test Samsung Account using the following sign-up page.
            https://account.samsung.com/account/signUp.do . The School shall provide his or her Test account School name
            and password to allow the Company to retrieve data from the School’s Smart Appliance.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The School shall ensure that the password chosen for the test account is unique and should not use a
            password used for other accounts. The Company shall not be liable for cases where a School uses their test
            account password for other accounts.
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
                School building level total power (electric) consumption every 6 seconds
              </ListItem>
              <ListItem className={classes.listItem}>
                School building gas consumption every 30 seconds
              </ListItem>
              <ListItem className={classes.listItem}>
                School floor plans uploaded by the user
              </ListItem>
              <ListItem className={classes.listItem}>
                School address, energy usage history, metering details, current supplier details; school bank details
                (if the school switches energy supplier via the portal), energy manager phone number or email (if they
                choose to set-up energy or temperature alerts via the platform)
              </ListItem>
              <ListItem className={classes.listItem}>
                All data collected from the Samsung SmartThings devices (data collected from a Samsung SmartThings
                device is outlined in Samsung’s Global Privacy Policy which can be read here:
                https://account.samsung.com/membership/pp)
              </ListItem>
            </List>
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            In the event that the Company collects information by which an individual can be identified, it shall obtain
            the approval of the School.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Information provided by the School cannot be used for purposes other than the provision of the service and
            for testing purposes during service development, nor can said information be provided to a third party
            without the prior consent of the relevant School, and the Company shall be liable for any violation of this
            requirement. Notwithstanding the foregoing, the following exceptions shall apply.
            <List component="ol" className={classes.olListRoot} dense>
              <ListItem className={classes.listItem}>
                In the event that information is provided in a form that does not reveal the identity of the
                individuals, for the purposes of statistics, academic research and marketing surveys
              </ListItem>
              <ListItem className={classes.listItem}>
                In the event that the information is provided to an affiliated company to enable the School to access an
                affiliated service (However, in such a case, the Company shall give prior notice to the School
                specifying the name of the affiliated company, the purpose of the provision, and the details of the
                information to be provided, and obtain the consent of the School.)
              </ListItem>
            </List>
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The School, at any time, may make a request for access to and correction of his or her information that is
            under the control of the Company, and the Company shall have the obligation to take any necessary measures
            to fulfil such request without delay. If the School makes a request for the correction of an error, the
            Company shall not use the relevant information until such information is duly corrected.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            For the protection of information, the Company shall limit the number of personal information managers to a
            minimum, and shall be liable for any and all damages to the School resulting from the loss, theft,
            disclosure, falsification, etc. of his or her personal information caused by the Company&rsquo;s intentional
            act
            or gross negligence.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Any third party receiving information from the Company shall destroy the relevant information when the
            purpose of its collection and provision is achieved.
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
            The School shall comply with notifications given by the Company from time to time with respect to this
            School Agreement, the relevant laws and regulations or the use of ETS.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The School shall not copy, reproduce or change information obtained using the ETS, nor provide others with
            such information without the prior consent of the Company.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The School shall not commit any of the following acts with respect to the use of ETS.
            <List component="ol" className={classes.olListRoot} dense>
              <ListItem className={classes.listItem}>
                Illegal use of another&rsquo;s School ID or Password
              </ListItem>
              <ListItem className={classes.listItem}>
                Defamation or slander of others, including the Company, its employees and its officers
              </ListItem>
              <ListItem className={classes.listItem}>
                Posting advertising materials without the prior approval of the Company, or continuous transmission of
                advertising mail or spam against the will of others
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
            The School shall have all rights and responsibilities for any and all contents posted by him or her through
            the ETS. In the event that the content of any posting falls under the categories defined in Paragraph 3 of
            this Article, the Company may delete it without giving prior notice to or obtaining the consent of the
            School.
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
            The Company will strive to provide continuous, stable and reliable service to the School in accordance with
            this School Agreement.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The Company shall indemnify the ETS School against any damages arising from an intentional act by the
            Company, or the Company&rsquo;s gross negligence. Notwithstanding the foregoing, the Company shall not be
            liable
            for any interruption or breakdown of the system specified in Article 11.
          </ListItemText>
        </ListItem>
      </List>

      <List className={classes.articleLists}>
        <ListSubheader className={classes.listSubHeader}>Article 11 (Interruption of operation of ETS and System
          breakdown)
        </ListSubheader>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The Company may temporarily interrupt the provision of the service for various reasons, such as repair and
            inspection or exchange of computation device, including computers or hacking, etc.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            In the event that the Company deems that it is impossible to conduct a test due to a system breakdown that
            is beyond the control of the Company, the Company may take any measures necessary, such as cancellation of
            testing contents already entered or input. A system breakdown means that it is impossible to access the ETS
            due to a system failure or a malfunction of the network connected to the system, or that it is impossible to
            receive or transmit a problem registration.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            If a failed entry of problem registration in the ETS is due to a malfunction of the School&rsquo;s network
            or a
            breakdown by the network service provider, failure of the School&rsquo;s system, etc., rather than due to a
            system
            breakdown specified in Paragraph 2 of this Article, such a failed entry is considered a non-transmission by
            the School.
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
            Copyright and all other intellectual property rights to the works made by the Company shall be owned by the
            Company.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The School shall not use information obtained during the use of the service, nor cause any third party to
            use such information for purposes other than sales of products or services, by means of reproduction,
            transmission, publication, distribution, broadcasting, or other methods without the prior approval of the
            Company.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The ETS and any necessary software used in connection with the system (&#34;Software&#34;) contain
            proprietary and
            confidential information that is protected by applicable intellectual property and other laws. No content
            from the ETS (other than your own electricity consumption data or posts to discussion groups) can be copied,
            captured or quoted in any manner without the express written permission of Samsung. Please contact us at
            smartenergy@samsung.com if you wish to make such a request.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            Decompilation, reverse engineering or re-engineering of any nature, or attempting to do so is strictly
            forbidden.
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
            If you have a complaint about material posted about the ETS or the testing processes, please send an email
            to smartenergy@samsung.com. If you have a complaint about any aspect of the ETS, please send an email to
            smartenergy@samsung.com . The Company cannot guarantee your issue will be dealt with promptly if any other
            mechanism is used.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The Company reserves the right to investigate suspected violations of these Terms of Use. This could involve
            gathering data from trial participants, the Company facilities, other service providers and the complainant.
            If such an investigation is required and while it is under investigation, the Company is within its rights
            to suspend the suspect account and either temporarily or permanently remove the material involved from the
            ETS.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            The Company may be bound by current or future legal statutes, such as the Regulation of Investigatory Powers
            Act 2000 to access, monitor, store, take copies of, or otherwise deal with the members’ data stored the
            service. Without limitation, you expressly authorise the Company to use personal data and other account
            information in connection with any such investigation, including disclosure to any third party authority
            that is considered to possess a legitimate interest in any such investigation or its outcome.
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
            The Company reserves the right to assign this contract at any time whether in whole or in part. You do not
            have this right but can cancel your contract after 1 year by contacting us at smartenergy@samsung.com
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
            If any of these Terms of Use are determined to be invalid or unenforceable pursuant to applicable law
            including, but not limited to, the Limitation of Liability and the Disclaimer of Warranties clauses at the
            end of this document, then the invalid or unenforceable provision will be deemed as having been superseded
            by a valid, enforceable provision which most closely matches the intent of the original provision and the
            remainder of the Terms of Use shall continue in effect.
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
            You agree to indemnify and hold the Company, and its subsidiaries, affiliates, officers, agents, co-branders
            or other partners, and employees, harmless from any claim or demand, including reasonable lawyers’ fees,
            made by any third party due to or arising out of your content, your use of the Company ETS and the Test
            Equipment, your connection to the service, your violation of the Terms of Use, or your violation of any
            rights of another.
          </ListItemText>
        </ListItem>

        <ListItem className={classes.listItemBlock}>
          <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
            <img src={listItemImage} className={classes.listItemImage} alt="list item" />
          </ListItemIcon>
          <ListItemText className={classes.listItemText}>
            If an item of Trial Equipment is defective the Company will replace or repair the item.
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
            YOU EXPRESSLY UNDERSTAND AND AGREE THAT THE ENERGY TRIAL SERVICE, SOFTWARE, DOCUMENTATION AND ANY ASSOCIATED
            MATERIALS ARE PROVIDED ON AN ‘AS IS’ BASIS WITH NO WARRANTIES WHATSOEVER. THE COMPANY AND THEIR SUPPLIERS
            EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND TO THE FULLEST EXTENT PERMITTED BY LAW WHETHER EXPRESS,
            IMPLIED OR STATUTORY WARRANTIES, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF (A) MERCHANTABILITY, (B) FIT
            FOR A PARTICULAR PURPOSE, (C) NON-INFRINGEMENT, (D) RELIABILITY, (E) INTERUPTION OF SERVICE, (F) TIMELINESS,
            (G) PERFORMANCE OR (H) ERROR FREE. SAMSUNG DISCLAIM ANY WARRANTIES REGARDING (A) THE SERVICE MEETING YOUR
            REQUIREMENTS, (B) ANY INFORMATION OR ADVICE OBTAINED THROUGH THE ETS, (C) QUALITY OF ANY GOODS, SERVICES,
            INFORMATION OR OTHER MATERIALS RECEIVED OR PURCHASED THROUGH THE SERVICE, (D) ANY ERRORS WILL BE CORRECTED.
            YOU UNDERSTAND AND AGREE THAT ANY MATERIAL DOWNLOADED OR OBTAINED THROUGH THE USE OF THE ENERGY TRIAL
            SERVICE IS AT YOUR OWN DISCRETION AND RISK AND THAT YOU ARE SOLELY RESPONSIBLE FOR ANY DAMAGES TO YOUR
            COMPUTER SYSTEM OR LOSS OF DATA THAT RESULTS FROM THE DOWNLOAD OF SUCH MATERIAL OR DATA.
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
            YOU EXPRESSLY UNDERSTAND AND AGREE THAT THE COMPANY WILL IN NO WAY BE LIABLE FOR ANY DAMAGES WHATSOEVER,
            INCLUDING BUT NOT LIMITED TO ANY DIRECT, INDIRECT, CONSEQUENTIAL, INCIDENTAL, PUNITIVE, EXEMPLARY, OR
            SPECIAL DAMAGES, OR DAMAGES INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, LOSS OF USE, GOODWILL OR ANY
            OTHER INTANGIBLES (EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES) RESULTING FROM OR
            ARISING OUT OF (A) PROCUREMENT COST OF SUBSTITUTE GOODS AND/OR SERVICES, (B) INABILITY OR USE OF THE
            SERVICE, (C) UNAUTHORISED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA, (D) UNAUTHORISED USE, (E)
            ANY PERFORMANCE OR NON-PERFORMANCE ISSUE RELATING TO THE SERVICE AND (F) ANY OTHER MATTER RELATING TO THE
            SERVICE.
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
            This School Agreement shall be effective from 15 October, 2018.
          </ListItemText>
        </ListItem>
      </List>

    </Grid>
  </Grid>
);

SchoolAgreement.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SchoolAgreement);
