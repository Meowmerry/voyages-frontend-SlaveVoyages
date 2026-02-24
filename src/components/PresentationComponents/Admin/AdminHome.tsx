import { Fragment, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import SidebarContribute from '@/components/NavigationComponents/SideBar/SidebarContribute';

import ContributeNavBar from '../Contribute/ContributeNavBar';
import '@/style/contributeContent.scss';
import ContributeContent from '../Contribute/ContributeContent';

// ── Types ────────────────────────────────────────────────────────────────────
interface ModelEntry {
  name: string;
  addUrl?: string;
  changeUrl: string;
}
interface AppSection {
  appLabel: string;
  appName: string;
  models: ModelEntry[];
}

// ── Admin sections (matching the real voyages Django admin) ──────────────────
const ADMIN_SECTIONS: AppSection[] = [
  {
    appLabel: 'auth',
    appName: 'Authentication and Authorization',
    models: [
      { name: 'Groups', changeUrl: '/admin/auth/group/' },
      {
        name: 'Users',
        addUrl: '/admin/auth/user/add/',
        changeUrl: '/admin/auth/user/',
      },
    ],
  },
  {
    appLabel: 'blog',
    appName: 'Blog',
    models: [
      {
        name: 'Authors',
        addUrl: '/admin/blog/author/add/',
        changeUrl: '/admin/blog/author/',
      },
      {
        name: 'Institutions',
        addUrl: '/admin/blog/institution/add/',
        changeUrl: '/admin/blog/institution/',
      },
      {
        name: 'Posts',
        addUrl: '/admin/blog/post/add/',
        changeUrl: '/admin/blog/post/',
      },
      {
        name: 'Short references',
        addUrl: '/admin/blog/shortref/add/',
        changeUrl: '/admin/blog/shortref/',
      },
      {
        name: 'Tags',
        addUrl: '/admin/blog/tag/add/',
        changeUrl: '/admin/blog/tag/',
      },
    ],
  },
  {
    appLabel: 'document',
    appName: 'Document',
    models: [
      {
        name: 'Doc sparse dates',
        addUrl: '/admin/document/docsparsedate/add/',
        changeUrl: '/admin/document/docsparsedate/',
      },
      {
        name: 'Doc tags',
        addUrl: '/admin/document/doctag/add/',
        changeUrl: '/admin/document/doctag/',
      },
      {
        name: 'Docs',
        addUrl: '/admin/document/doc/add/',
        changeUrl: '/admin/document/doc/',
      },
      {
        name: 'Pages',
        addUrl: '/admin/document/page/add/',
        changeUrl: '/admin/document/page/',
      },
    ],
  },
  {
    appLabel: 'common',
    appName: 'Common',
    models: [
      {
        name: 'Locations',
        addUrl: '/admin/common/location/add/',
        changeUrl: '/admin/common/location/',
      },
      {
        name: 'Sources',
        addUrl: '/admin/common/source/add/',
        changeUrl: '/admin/common/source/',
      },
      {
        name: 'Sparse dates',
        addUrl: '/admin/common/sparsedate/add/',
        changeUrl: '/admin/common/sparsedate/',
      },
    ],
  },
  {
    appLabel: 'past',
    appName: 'Past',
    models: [
      {
        name: 'Enslaved',
        addUrl: '/admin/past/enslaved/add/',
        changeUrl: '/admin/past/enslaved/',
      },
      {
        name: 'Enslavement relations',
        addUrl: '/admin/past/enslavementrelation/add/',
        changeUrl: '/admin/past/enslavementrelation/',
      },
      {
        name: 'Enslaver aliases',
        addUrl: '/admin/past/enslaveralias/add/',
        changeUrl: '/admin/past/enslaveralias/',
      },
      {
        name: 'Enslaver identities',
        addUrl: '/admin/past/enslaveridentity/add/',
        changeUrl: '/admin/past/enslaveridentity/',
      },
      { name: 'Enslaver roles', changeUrl: '/admin/past/enslaverrole/' },
      {
        name: 'Owner outcomes',
        addUrl: '/admin/past/owneroutcome/add/',
        changeUrl: '/admin/past/owneroutcome/',
      },
      {
        name: 'Particular outcomes',
        addUrl: '/admin/past/particularoutcome/add/',
        changeUrl: '/admin/past/particularoutcome/',
      },
      {
        name: 'Slaves outcomes',
        addUrl: '/admin/past/slavesoutcome/add/',
        changeUrl: '/admin/past/slavesoutcome/',
      },
      {
        name: 'Vessel captured outcomes',
        addUrl: '/admin/past/vesselcapturedoutcome/add/',
        changeUrl: '/admin/past/vesselcapturedoutcome/',
      },
    ],
  },
  {
    appLabel: 'voyage',
    appName: 'Voyage',
    models: [
      {
        name: 'Cargo types',
        addUrl: '/admin/voyage/cargotype/add/',
        changeUrl: '/admin/voyage/cargotype/',
      },
      {
        name: 'Cargo units',
        addUrl: '/admin/voyage/cargounit/add/',
        changeUrl: '/admin/voyage/cargounit/',
      },
      {
        name: 'Nationalities',
        addUrl: '/admin/voyage/nationality/add/',
        changeUrl: '/admin/voyage/nationality/',
      },
      {
        name: 'Resistances',
        addUrl: '/admin/voyage/resistance/add/',
        changeUrl: '/admin/voyage/resistance/',
      },
      {
        name: 'Voyage sparse dates',
        addUrl: '/admin/voyage/voyagesparsedate/add/',
        changeUrl: '/admin/voyage/voyagesparsedate/',
      },
      {
        name: 'Voyages',
        addUrl: '/admin/voyage/voyage/add/',
        changeUrl: '/admin/voyage/voyage/',
      },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────────────────
const AdminHome: React.FC = () => {
  const navigate = useNavigate();
  const [openSideBar, setOpenSideBar] = useState(false);
  const handleDrawerOpen = () => setOpenSideBar(!openSideBar);

  const go = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(url);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8f8f8',
        fontFamily:
          '"Lucida Grande","DejaVu Sans","Bitstream Vera Sans",Verdana,Arial,sans-serif',
        fontSize: 13,
        color: '#333',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div id="branding" style={{ float: 'left', paddingTop: 6 }}>
        <h1
          style={{
            padding: '0px 10px 5px 0px',
            margin: 0,
            fontWeight: 'normal',
            fontSize: 18,
          }}
        >
          Voyage Admin Live
        </h1>
        <h2
          style={{
            padding: 0,
            fontSize: 12,
            margin: '-6px 0 8px 0',
            fontWeight: 'normal',
            opacity: 0.8,
          }}
        >
          Any changes will take effect immediately
        </h2>
      </div>
      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div
        id="content"
        style={{
          margin: '10px auto',
          maxWidth: 700,
          padding: '0 15px',
        }}
      >
        <h1
          style={{
            fontSize: 18,
            color: '#666',
            margin: '0 0 12px 0',
            fontWeight: 'bold',
          }}
        >
          Site administration
        </h1>

        {ADMIN_SECTIONS.map((section) => (
          <div
            key={section.appLabel}
            style={{
              border: '1px solid #ccc',
              marginBottom: 8,
              background: 'white',
            }}
          >
            {/* Section caption */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <caption
                style={{
                  margin: 0,
                  padding: '2px 5px 3px 5px',
                  fontSize: 11,
                  textAlign: 'left',
                  fontWeight: 'bold',
                  background: '#008ca8',
                  color: 'white',
                  captionSide: 'top',
                }}
              >
                <a
                  href={`/admin/${section.appLabel}/`}
                  style={{ color: 'white', textDecoration: 'none' }}
                  onClick={(e) => e.preventDefault()}
                >
                  {section.appName}
                </a>
              </caption>

              <tbody>
                {section.models.map((model, idx) => (
                  <Fragment key={model.name}>
                    <tr
                      style={{
                        background: idx % 2 === 0 ? '#EDF3FE' : '#fff',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          '#d0e3f0')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          idx % 2 === 0 ? '#EDF3FE' : '#fff')
                      }
                    >
                      {/* Model name */}
                      <th
                        scope="row"
                        style={{
                          padding: '5px 8px',
                          fontWeight: 'normal',
                          borderBottom: '1px solid #ddd',
                          width: '60%',
                        }}
                      >
                        {model.changeUrl ? (
                          <a
                            href={model.changeUrl}
                            style={{
                              color: '#005a87',
                              fontWeight: 'bold',
                              textDecoration: 'none',
                              fontSize: 12,
                            }}
                            onClick={go(model.changeUrl)}
                          >
                            {model.name}
                          </a>
                        ) : (
                          <span style={{ fontSize: 12 }}>{model.name}</span>
                        )}
                      </th>

                      {/* Add */}
                      <td
                        style={{
                          padding: '5px 8px',
                          borderBottom: '1px solid #ddd',
                          width: '20%',
                          textAlign: 'right',
                        }}
                      >
                        {model.addUrl ? (
                          <a
                            href={model.addUrl}
                            className="addlink"
                            style={{
                              color: '#417690',
                              fontSize: 11,
                              textDecoration: 'none',
                              paddingLeft: 14,
                              background:
                                'url(https://legacy.slavevoyages.org/static/admin/img/icon_addlink.gif) 0 0.2em no-repeat',
                            }}
                            onClick={(e) => e.preventDefault()}
                          >
                            Add
                          </a>
                        ) : (
                          <span>&nbsp;</span>
                        )}
                      </td>

                      {/* Change */}
                      <td
                        style={{
                          padding: '5px 8px',
                          borderBottom: '1px solid #ddd',
                          width: '20%',
                          textAlign: 'right',
                        }}
                      >
                        <a
                          href={model.changeUrl}
                          className="changelink"
                          style={{
                            color: '#417690',
                            fontSize: 11,
                            textDecoration: 'none',
                            paddingLeft: 14,
                            background:
                              'url(https://legacy.slavevoyages.org/static/admin/img/icon_changelink.gif) 0 0.2em no-repeat',
                          }}
                          onClick={go(model.changeUrl)}
                        >
                          Change
                        </a>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div
        id="footer"
        style={{
          clear: 'both',
          paddingLeft: 17,
          paddingTop: 4,
          fontSize: 11,
          color: '#999',
        }}
      >
        <p>
          <a
            href="https://legacy.slavevoyages.org/admin/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#417690' }}
          >
            Open Legacy Admin ↗
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminHome;
