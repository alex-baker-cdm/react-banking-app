import SwiftUI

extension String {
    /// For SwiftUI Text and other views accepting LocalizedStringKey
    var localized: LocalizedStringKey { LocalizedStringKey(self) }

    /// For contexts needing a resolved String (alerts, view models, non-SwiftUI)
    var localizedString: String {
        NSLocalizedString(self, comment: "\(self)_comment")
    }

    /// Resolved string with `%@` / `%d` placeholders filled in (also resolves `.stringsdict` plurals).
    func localizedFormat(_ arguments: CVarArg...) -> String {
        String(format: localizedString, locale: Locale.current, arguments: arguments)
    }
}
